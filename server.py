"""Techtenstein Slug API — MCP server."""
import asyncio, sys
import httpx
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import TextContent, Tool

API_BASE = "https://slug-api.techtenstein.workers.dev"
server = Server("techtenstein-slug")

@server.list_tools()
async def list_tools() -> list[Tool]:
    return [Tool(
        name="slugify",
        description="Convert any text into a clean, URL-safe slug. Unicode-aware.",
        inputSchema={
            "type": "object",
            "properties": {
                "text": {"type": "string", "description": "The text to slugify (max 500 chars)"},
                "max": {"type": "integer", "description": "Max slug length (default 60)", "default": 60},
                "sep": {"type": "string", "description": "Separator character (default '-')", "default": "-"},
                "lower": {"type": "boolean", "description": "Lowercase output (default true)", "default": True},
            },
            "required": ["text"],
        },
    )]

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name != "slugify":
        return [TextContent(type="text", text=f"Unknown tool: {name}")]
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.post(API_BASE + "/", json=arguments)
        return [TextContent(type="text", text=r.text)]

async def _main():
    async with stdio_server() as (read, write):
        await server.run(read, write, server.create_initialization_options())

def main():
    asyncio.run(_main())

if __name__ == "__main__":
    main()
