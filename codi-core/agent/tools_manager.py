from typing import Dict, Any, List, Callable
from .tools import files, system, project

TOOL_REGISTRY: Dict[str, Callable] = {
    "create_folder": lambda workspace, params: files.create_folder(workspace, params["path"]),
    "write_file": lambda workspace, params: files.write_file(workspace, params["path"], params["content"]),
    "read_file": lambda workspace, params: files.read_file(workspace, params["path"]),
    "list_directory": lambda workspace, params: files.list_directory(workspace, params.get("path", "")),
    "delete_file": lambda workspace, params: files.delete_file(workspace, params["path"]),
    "run_command": lambda workspace, params: system.run_command(workspace, params["command"]),
    "check_port": lambda workspace, params: system.check_port(params.get("port", 3000)),
    "init_project": lambda workspace, params: project.init_project(workspace, params.get("template", "npm")),
    "install_deps": lambda workspace, params: project.install_deps(workspace, params["packages"]),
    "start_server": lambda workspace, params: project.start_server(workspace, params.get("command", "npm start")),
    "check_port_status": lambda workspace, params: project.check_port_status(workspace, params.get("port", 3000)),
    "noop": lambda workspace, params: {"success": True, "message": "No operation"},
}


def get_tools_description() -> str:
    return """
create_folder(path) — crear carpeta
write_file(path, content) — escribir archivo (crea directorios padre)
read_file(path) — leer contenido de archivo
list_directory(path?) — listar archivos y carpetas
delete_file(path) — borrar archivo o carpeta
run_command(command) — ejecutar comando (npm, pip, git, node, python, npx, docker, cargo, tsc)
check_port(port=3000) — verificar si un puerto esta en uso
init_project(template="npm") — inicializar proyecto (npm, python, react, next)
install_deps(packages) — instalar dependencias npm
start_server(command="npm start") — iniciar servidor de desarrollo
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
