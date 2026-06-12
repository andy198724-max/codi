from typing import Dict, Any, List, Callable
from .tools import files, system, project, search, web, testing, tasks, mcp

TOOL_REGISTRY: Dict[str, Callable] = {
    # Files
    "create_folder": lambda w, p: files.create_folder(w, p["path"]),
    "write_file": lambda w, p: files.write_file(w, p["path"], p["content"]),
    "read_file": lambda w, p: files.read_file(w, p["path"]),
    "list_directory": lambda w, p: files.list_directory(w, p.get("path", "")),
    "delete_file": lambda w, p: files.delete_file(w, p["path"]),
    "edit_file": lambda w, p: search.edit_file(w, p["path"], p["old_string"], p["new_string"]),
    "find_files": lambda w, p: search.find_files(w, p["pattern"]),
    "search_content": lambda w, p: search.search_content(w, p["regex"], p.get("file_pattern", "*")),
    # System
    "run_command": lambda w, p: system.run_command(w, p["command"]),
    "check_port": lambda w, p: system.check_port(p.get("port", 3000)),
    # Project
    "init_project": lambda w, p: project.init_project(w, p.get("template", "npm")),
    "install_deps": lambda w, p: project.install_deps(w, p["packages"]),
    "start_server": lambda w, p: project.start_server(w, p.get("command", "npm start")),
    # Web
    "fetch_url": lambda w, p: web.fetch_url(w, p["url"]),
    "web_search": lambda w, p: web.web_search(w, p["query"]),
    "preview_browser": lambda w, p: web.preview_browser(w, p.get("url", "http://localhost:3000")),
    # Testing
    "run_tests": lambda w, p: testing.run_tests(w, p.get("command", "npm test")),
    "lint_check": lambda w, p: testing.lint_check(w, p["file_path"]),
    # Jupyter
    "read_notebook": lambda w, p: search.read_notebook(w, p["path"], p.get("cell_index", -1)),
    "edit_notebook": lambda w, p: search.edit_notebook(w, p["path"], p["cell_index"], p["content"]),
    # Tasks
    "todo_create": lambda w, p: tasks.todo_create(w, p["tasks"]),
    "todo_list": lambda w, p: tasks.todo_list(w),
    "todo_update": lambda w, p: tasks.todo_update(w, p["task_id"], p["status"]),
    # MCP
    "mcp_invoke": lambda w, p: mcp.mcp_invoke(w, p["server"], p["tool"], p.get("params", {})),
    "mcp_list_servers": lambda w, p: mcp.mcp_list_servers(w),
    "noop": lambda w, p: {"success": True, "message": "No operation"},
}


def get_tools_description() -> str:
    return """
ARCHIVOS: read_file, write_file, edit_file(path, old_string, new_string), create_folder, delete_file,
  list_directory, find_files(glob), search_content(regex, file_pattern?)
JUPYTER: read_notebook(path, cell_index?), edit_notebook(path, cell_index, content)
TERMINAL: run_command(command), check_port(port), init_project(template),
  install_deps(packages), start_server(command)
WEB: fetch_url(url), web_search(query), preview_browser(url?)
TESTING: run_tests(command?), lint_check(file_path)
TAREAS: todo_create(tasks[]), todo_list(), todo_update(task_id, status)
"""


def execute_tool(workspace: str, tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
    func = TOOL_REGISTRY.get(tool_name)
    if not func:
        return {"success": False, "error": f"Unknown tool: {tool_name}. Available: {list(TOOL_REGISTRY.keys())}"}
    try:
        return func(workspace, params)
    except KeyError as e:
        return {"success": False, "error": f"Missing required parameter: {e}"}
    except Exception as e:
        return {"success": False, "error": f"Tool execution error: {e}"}
