from typing import Dict, Any


def mcp_invoke(workspace: str, server_name: str, tool_name: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
    return {"success": False, "error": "MCP not yet configured. Install an MCP server in settings."}


def mcp_list_servers(workspace: str) -> Dict[str, Any]:
    return {"success": True, "servers": [], "note": "MCP servers not yet configured"}
