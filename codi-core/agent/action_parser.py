import json
import re
from typing import Dict, Any, List, Optional


def parse_actions(text: str) -> List[Dict[str, Any]]:
    actions = []
    json_candidates = _extract_json_blocks(text)
    for candidate in json_candidates:
        try:
            parsed = json.loads(candidate)
            if isinstance(parsed, dict) and "action" in parsed:
                actions.append(parsed)
            elif isinstance(parsed, list):
                for item in parsed:
                    if isinstance(item, dict) and "action" in item:
                        actions.append(item)
        except json.JSONDecodeError:
            continue
    if not actions:
        actions = _extract_inline_actions(text)
    return actions


def _extract_json_blocks(text: str) -> List[str]:
    blocks = []
    matches = re.finditer(r'```(?:json)?\s*\n?(.*?)\n?```', text, re.DOTALL)
    for m in matches:
        blocks.append(m.group(1).strip())
    matches = re.finditer(r'\{[^{}]*"action"\s*:\s*"[^"]+"[^{}]*\}', text, re.DOTALL)
    for m in matches:
        blocks.append(m.group(0).strip())
    return blocks


def _extract_inline_actions(text: str) -> List[Dict[str, Any]]:
    actions = []
    pattern = r'\{\s*"action"\s*:\s*"([^"]+)"\s*,\s*"params"\s*:\s*(\{[^}]+\})\s*\}'
    for m in re.finditer(pattern, text):
        try:
            action = json.loads(m.group(0))
            actions.append(action)
        except json.JSONDecodeError:
            try:
                action = {
                    "action": m.group(1),
                    "params": json.loads(m.group(2)),
                }
                actions.append(action)
            except json.JSONDecodeError:
                continue
    return actions


def is_finished(text: str) -> bool:
    indicators = [
        "TAREA_FINALIZADA",
        "TASK_COMPLETED",
        "TAREA COMPLETADA",
        "FINALIZADO",
        "ALL DONE",
    ]
    return any(indicator.lower() in text.lower() for indicator in indicators)
