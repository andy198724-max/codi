import os
from pathlib import Path
from typing import Dict, Any


def _resolve_path(workspace: str, rel_path: str) -> Path:
    base = Path(workspace).resolve()
    target = (base / rel_path).resolve()
    if not str(target).startswith(str(base)):
        raise PermissionError(f"Access denied: {rel_path} is outside workspace")
    return target


def create_folder(workspace: str, path: str) -> Dict[str, Any]:
    try:
        target = _resolve_path(workspace, path)
        target.mkdir(parents=True, exist_ok=True)
        return {"success": True, "created": str(target)}
    except PermissionError as e:
        return {"success": False, "error": str(e)}
    except Exception as e:
        return {"success": False, "error": str(e)}


def write_file(workspace: str, path: str, content: str) -> Dict[str, Any]:
    try:
        target = _resolve_path(workspace, path)
        target.parent.mkdir(parents=True, exist_ok=True)
        with open(target, "w", encoding="utf-8") as f:
            f.write(content)
        return {"success": True, "written": str(target), "size": len(content)}
    except PermissionError as e:
        return {"success": False, "error": str(e)}
    except Exception as e:
        return {"success": False, "error": str(e)}


def read_file(workspace: str, path: str) -> Dict[str, Any]:
    try:
        target = _resolve_path(workspace, path)
        if not target.exists():
            return {"success": False, "error": f"File not found: {path}"}
        if target.is_dir():
            return {"success": False, "error": f"Path is a directory: {path}"}
        if target.stat().st_size > 1024 * 1024:
            return {"success": False, "error": "File too large (>1MB)"}
        with open(target, "r", encoding="utf-8") as f:
            content = f.read()
        return {"success": True, "content": content, "path": str(target)}
    except PermissionError as e:
        return {"success": False, "error": str(e)}
    except Exception as e:
        return {"success": False, "error": str(e)}


def list_directory(workspace: str, path: str = "") -> Dict[str, Any]:
    try:
        target = _resolve_path(workspace, path) if path else Path(workspace)
        if not target.exists():
            return {"success": False, "error": f"Directory not found: {path}"}
        if not target.is_dir():
            return {"success": False, "error": f"Not a directory: {path}"}
        items = []
        for entry in sorted(target.iterdir()):
            items.append({
                "name": entry.name,
                "type": "dir" if entry.is_dir() else "file",
                "size": entry.stat().st_size if entry.is_file() else 0,
            })
        return {"success": True, "items": items[:100], "count": len(items)}
    except PermissionError as e:
        return {"success": False, "error": str(e)}
    except Exception as e:
        return {"success": False, "error": str(e)}


def delete_file(workspace: str, path: str) -> Dict[str, Any]:
    try:
        target = _resolve_path(workspace, path)
        if not target.exists():
            return {"success": False, "error": f"Not found: {path}"}
        if target.is_dir():
            import shutil
            shutil.rmtree(target)
        else:
            target.unlink()
        return {"success": True, "deleted": str(target)}
    except PermissionError as e:
        return {"success": False, "error": str(e)}
    except Exception as e:
        return {"success": False, "error": str(e)}
