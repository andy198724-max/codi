import os
import subprocess
import shutil
from pathlib import Path
from typing import Dict, Any

WHITELIST_COMMANDS = [
    "npm", "npx", "yarn", "pnpm", "node",
    "pip", "pip3", "python", "python3", "py",
    "git", "docker", "cargo", "rustc",
    "tsc", "npx", "eslint", "prettier",
    "code", "cursor",
]

BLOCKED_PATTERNS = [
    "rm -rf /", "rm -rf ~", "rm -rf .",
    "format", "del /f /s",
    "shutdown", "reboot", "halt",
    "> /dev/sda", "dd if=",
    "chmod 777 /", "chown",
    "sudo", "su ",
    "curl", "wget",
    ":(){ :|:& };:",  # fork bomb
]


def is_command_allowed(cmd: str) -> bool:
    for blocked in BLOCKED_PATTERNS:
        if blocked.lower() in cmd.lower():
            return False
    cmd_parts = cmd.strip().split()
    if not cmd_parts:
        return False
    base_cmd = os.path.basename(cmd_parts[0]) if cmd_parts else cmd_parts[0]
    if base_cmd not in WHITELIST_COMMANDS and "\\" not in base_cmd and "/" not in base_cmd:
        return False
    return True


def run_command(workspace: str, command: str) -> Dict[str, Any]:
    if not is_command_allowed(command):
        return {"success": False, "error": f"Command not allowed: {command}"}
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=workspace,
            capture_output=True,
            text=True,
            timeout=120,
        )
        return {
            "success": result.returncode == 0,
            "stdout": result.stdout[-5000:],
            "stderr": result.stderr[-2000:],
            "returncode": result.returncode,
        }
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Command timed out (120s)"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def check_port(port: int) -> Dict[str, Any]:
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.settimeout(2)
        s.connect(("localhost", port))
        s.close()
        return {"success": True, "running": True, "port": port}
    except Exception:
        return {"success": True, "running": False, "port": port}
