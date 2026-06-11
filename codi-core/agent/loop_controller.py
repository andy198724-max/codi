import asyncio
import logging
from typing import Dict, Any, List, Optional, AsyncGenerator

from .tools_manager import execute_tool, get_tools_description
from .action_parser import parse_actions, is_finished

logger = logging.getLogger("codi.agent")


AGENT_SYSTEM_PROMPT = """Eres CODI Agente Autonomo. Tienes acceso a herramientas reales del sistema.
Tu objetivo es completar tareas de programacion de forma autonoma.

HERRAMIENTAS DISPONIBLES:
{tools_desc}

FORMATO DE RESPUESTA:
Cuando necesites ejecutar una accion, responde SOLO con un bloque JSON:
```json
{{"action": "nombre_herramienta", "params": {{...}}}}
```

CUANDO TERMINES TODO respondes SOLO con: TAREA_FINALIZADA

EJEMPLOS:
- Para escribir un archivo:
```json
{{"action": "write_file", "params": {{"path": "src/index.js", "content": "console.log('hola');"}}}}
```

- Para ejecutar un comando:
```json
{{"action": "run_command", "params": {{"command": "npm init -y"}}}}
```

REGLAS:
1. Planea ANTES de actuar. Piensa: que necesito crear, en que orden.
2. Ejecuta UNA accion a la vez. Espera el resultado antes de la siguiente.
3. Si una accion falla, analiza el error y corrige. NO te rindas al primer error.
4. NO expliques lo que haces en texto, solo genera JSON de acciones.
5. Responde en espanol SOLO cuando finalices o necesites aclarar algo.
6. Trabaja SOLO dentro del workspace asignado.
7. Usa rutas RELATIVAS, nunca absolutas."""


async def run_agent(
    engine,
    messages: List[Dict[str, Any]],
    workspace: str,
    max_iterations: int = 50,
    temperature: float = 0.1,
    max_tokens: int = 4096,
) -> AsyncGenerator[Dict[str, Any], None]:
    system_msg = AGENT_SYSTEM_PROMPT.format(tools_desc=get_tools_description())
    agent_messages = [{"role": "system", "content": system_msg}] + list(messages)
    
    current_context = list(agent_messages)
    iteration = 0
    
    yield {"type": "status", "message": f"Iniciando agente autonomo en workspace: {workspace}", "iteration": 0}
    
    while iteration < max_iterations:
        iteration += 1
        
        try:
            response = ""
            async for chunk in engine.generate(
                current_context,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True,
            ):
                response = chunk
            
            actions = parse_actions(response)
            
            if actions:
                for action in actions:
                    tool_name = action.get("action", "")
                    params = action.get("params", {})
                    
                    yield {
                        "type": "action",
                        "tool": tool_name,
                        "params": params,
                        "iteration": iteration,
                    }
                    
                    result = execute_tool(workspace, tool_name, params)
                    
                    yield {
                        "type": "result",
                        "tool": tool_name,
                        "result": result,
                        "iteration": iteration,
                    }
                    
                    result_msg = f"Tool {tool_name} result: {result}"
                    current_context.append({"role": "user", "content": result_msg})
                    
                    if not result.get("success", False):
                        current_context.append({
                            "role": "system",
                            "content": f"Error en {tool_name}: {result.get('error', 'unknown')}. Corrige e intenta de nuevo."
                        })
            
            elif is_finished(response):
                yield {"type": "done", "message": response, "iteration": iteration, "total_iterations": iteration}
                return
            else:
                yield {
                    "type": "response",
                    "content": response,
                    "iteration": iteration,
                    "total_iterations": iteration,
                }
                return
                
        except Exception as e:
            logger.error(f"Agent loop error at iteration {iteration}: {e}")
            yield {"type": "error", "message": str(e), "iteration": iteration}
            return
    
    yield {"type": "done", "message": "Max iterations reached", "iteration": iteration, "total_iterations": iteration}
