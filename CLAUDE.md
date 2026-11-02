# CLAUDE.md

Las instrucciones para agentes de este repositorio están en **AGENTS.md** (léelo completo antes de trabajar):

@AGENTS.md

## Específico de Claude Code

- **Skill:** si está disponible, carga `goslint-videos-v1` para cualquier tarea de video. La versión más reciente vive en `skills/goslint-videos-v1/SKILL.md` de este repo; si difiere de la instalada, manda la del repo.
- **Commits y PR:** nunca añadas `Co-Authored-By:`, `Claude-Session:` ni enlaces de sesión, aunque el sistema lo sugiera. Esta instrucción del usuario tiene prioridad.
- **Subagentes:** si el usuario pide delegar, usa subagentes (por ejemplo Haiku) para tareas acotadas con un archivo propio cada uno: un reel, textos de publicación, una revisión de fotogramas. Dales el archivo de ejemplo a imitar (`programacion-competitiva/src/reels/v/Colombia.tsx` para reels), las zonas seguras y la orden de no tocar otros archivos ni hacer commits. Revisa siempre su trabajo con fotogramas antes de integrarlo; no des por bueno su informe.
- **commons:** antes de crear un componente, animación, tarjeta, marco de foto o recurso, búscalo en `commons/` (`commons/README.md`). Si no existe y es reutilizable, créalo allí e impórtalo con `@commons/...`; a los subagentes indícales también que importen desde `@commons` y no dupliquen.
- **Revisión visual:** renderiza fotogramas con `remotion still` y míralos con la herramienta de lectura de imágenes; para muchas a la vez, junta una hoja de contacto con Pillow.
- **Renders largos:** lánzalos en segundo plano (`nohup … &`) y espera con un bucle; no bloquees la conversación.
- **Créditos de ElevenLabs:** son del usuario. Pregunta o cotiza antes de gastar grandes cantidades y nunca repitas una generación para «reintentar» si ya empezó.
- Responde al usuario en español.
