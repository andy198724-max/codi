import json
from pathlib import Path
from typing import Dict, Any, List


def _todo_path(workspace: str) -> Path:
    return Path(workspace) / ".codi_todos.json"


def _load(workspace: str) -> List[Dict]:
    p = _todo_path(workspace)
    if p.exists():
        return json.loads(p.read_text())
    return []


def _save(workspace: str, todos: List[Dict]):
    _todo_path(workspace).write_text(json.dumps(todos, indent=2))


def todo_create(workspace: str, tasks: List[str]) -> Dict[str, Any]:
    existing = _load(workspace)
    new_tasks = []
    for t in tasks:
        tid = str(len(existing) + len(new_tasks) + 1)
        task = {"id": tid, "title": t, "status": "pending"}
        new_tasks.append(task)
    _save(workspace, existing + new_tasks)
    return {"success": True, "created": new_tasks}


def todo_list(workspace: str) -> Dict[str, Any]:
    todos = _load(workspace)
    return {"success": True, "todos": todos, "count": len(todos)}


def todo_update(workspace: str, task_id: str, status: str) -> Dict[str, Any]:
    todos = _load(workspace)
    for t in todos:
        if t["id"] == task_id:
            t["status"] = status
            _save(workspace, todos)
            return {"success": True, "updated": t}
    return {"success": False, "error": f"Task {task_id} not found"}
