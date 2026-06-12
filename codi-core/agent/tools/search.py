import os, re, json
from pathlib import Path
from typing import Dict, Any, List


def find_files(workspace: str, pattern: str) -> Dict[str, Any]:
    try:
        base = Path(workspace)
        matches = sorted(base.rglob(pattern))
        files = [{"name": str(m.relative_to(base)), "path": str(m), "is_dir": m.is_dir(), "size": m.stat().st_size if m.is_file() else 0} for m in matches[:100]]
        return {"success": True, "files": files, "count": len(files)}
    except Exception as e:
        return {"success": False, "error": str(e)}


def search_content(workspace: str, regex: str, file_pattern: str = "*") -> Dict[str, Any]:
    try:
        base = Path(workspace)
        compiled = re.compile(regex, re.IGNORECASE)
        results = []
        for f in sorted(base.rglob(file_pattern)):
            if f.is_file() and f.suffix in [".py", ".js", ".ts", ".tsx", ".jsx", ".json", ".yaml", ".yml", ".md", ".html", ".css", ".rs", ".go", ".java", ".kt", ".sh", ".sql", ".toml", ".xml", ".rb", ".php", ".c", ".cpp", ".h", ".hpp"]:
                try:
                    if f.stat().st_size > 500 * 1024:
                        continue
                    with open(f, encoding="utf-8", errors="ignore") as fh:
                        for i, line in enumerate(fh, 1):
                            if compiled.search(line):
                                results.append({"file": str(f.relative_to(base)), "line": i, "content": line.strip()[:200]})
                                if len(results) >= 50:
                                    break
                except Exception:
                    pass
            if len(results) >= 50:
                break
        return {"success": True, "results": results, "count": len(results)}
    except Exception as e:
        return {"success": False, "error": str(e)}


def edit_file(workspace: str, path: str, old_string: str, new_string: str) -> Dict[str, Any]:
    try:
        target = (Path(workspace) / path).resolve()
        if not str(target).startswith(str(Path(workspace).resolve())):
            return {"success": False, "error": "Access denied: outside workspace"}
        with open(target, encoding="utf-8") as f:
            content = f.read()
        if old_string not in content:
            return {"success": False, "error": "old_string not found in file"}
        new_content = content.replace(old_string, new_string, 1)
        with open(target, "w", encoding="utf-8") as f:
            f.write(new_content)
        return {"success": True, "path": str(target), "changes": 1}
    except Exception as e:
        return {"success": False, "error": str(e)}


def read_notebook(workspace: str, path: str, cell_index: int = -1) -> Dict[str, Any]:
    try:
        target = (Path(workspace) / path).resolve()
        with open(target, encoding="utf-8") as f:
            nb = json.load(f)
        cells = nb.get("cells", [])
        if cell_index >= 0 and cell_index < len(cells):
            cell = cells[cell_index]
            return {"success": True, "cell_index": cell_index, "cell_type": cell.get("cell_type"), "source": "".join(cell.get("source", []))}
        summaries = [{"index": i, "type": c.get("cell_type"), "preview": "".join(c.get("source", []))[:100]} for i, c in enumerate(cells)]
        return {"success": True, "cells": summaries, "count": len(cells)}
    except Exception as e:
        return {"success": False, "error": str(e)}


def edit_notebook(workspace: str, path: str, cell_index: int, new_content: str) -> Dict[str, Any]:
    try:
        target = (Path(workspace) / path).resolve()
        with open(target, encoding="utf-8") as f:
            nb = json.load(f)
        if cell_index < 0 or cell_index >= len(nb.get("cells", [])):
            return {"success": False, "error": f"Cell index out of range (0-{len(nb.get('cells',[]))-1})"}
        nb["cells"][cell_index]["source"] = [new_content]
        with open(target, "w", encoding="utf-8") as f:
            json.dump(nb, f, indent=1)
        return {"success": True, "path": str(target), "cell_index": cell_index}
    except Exception as e:
        return {"success": False, "error": str(e)}
