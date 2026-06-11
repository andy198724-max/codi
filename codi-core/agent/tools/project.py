from typing import Dict, Any
from .system import run_command, check_port


def init_project(workspace: str, template: str = "npm") -> Dict[str, Any]:
    commands = {
        "npm": "npm init -y",
        "python": "python -c \"print('project ready')\"",
        "react": "npx create-react-app .",
        "next": "npx create-next-app@latest .",
    }
    cmd = commands.get(template, commands["npm"])
    return run_command(workspace, cmd)


def install_deps(workspace: str, packages: str) -> Dict[str, Any]:
    return run_command(workspace, f"npm install {packages}")


def start_server(workspace: str, command: str = "npm start") -> Dict[str, Any]:
    return run_command(workspace, command)


def check_port_status(workspace: str, port: int = 3000) -> Dict[str, Any]:
    return check_port(port)
