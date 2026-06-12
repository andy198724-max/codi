import urllib.request
import json
from typing import Dict, Any


def fetch_url(workspace: str, url: str) -> Dict[str, Any]:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Codi/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = resp.read().decode("utf-8", errors="replace")
            return {"success": True, "status": resp.status, "content": body[:10000], "content_type": resp.headers.get("Content-Type", "")}
    except Exception as e:
        return {"success": False, "error": str(e)}


def web_search(workspace: str, query: str) -> Dict[str, Any]:
    return {"success": True, "results": [], "note": "Web search not yet configured. Add a search API key in settings."}


def preview_browser(workspace: str, url: str = "http://localhost:3000") -> Dict[str, Any]:
    try:
        import webbrowser
        webbrowser.open(url)
        return {"success": True, "url": url, "message": f"Browser opened at {url}"}
    except Exception as e:
        return {"success": False, "error": str(e)}
