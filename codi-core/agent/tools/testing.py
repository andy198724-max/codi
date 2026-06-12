from typing import Dict, Any
from .system import run_command


def run_tests(workspace: str, command: str = "npm test") -> Dict[str, Any]:
    return run_command(workspace, command)


def lint_check(workspace: str, file_path: str) -> Dict[str, Any]:
    full = f"{workspace}/{file_path}" if not file_path.startswith(workspace) else file_path
    return run_command(workspace, f"npx eslint {full} 2>&1 || echo 'Lint complete'")
