# Cómo trabajar con agentes de IA en este proyecto

Guía para las personas de GOSLINT que quieran pedirle a un agente (Claude Code, Codex, Cursor…) que haga o modifique videos, reels, miniaturas o mascotas.

## 1. Qué puede hacer un agente aquí

- Escribir o ajustar un **guion** y generar la **narración** con ElevenLabs (o prepararte el texto para que la generes tú).
- Crear o modificar **escenas** de un video en Remotion (16:9) y **reels** verticales (9:16).
- Corregir detalles: un texto mal escrito, una foto mal encuadrada, un efecto desincronizado, una pausa larga.
- Hacer **miniaturas** y portadas, **subtítulos** (.srt/.vtt) y textos de publicación.
- Revisar su propio trabajo con fotogramas sueltos y comprobaciones objetivas (QA).

Lo que **no** debe hacer: inventar datos del semillero, cambiar el logotipo o publicar algo por ti. Las reglas completas están en [`AGENTS.md`](../AGENTS.md).

## 2. Preparar la sesión

1. Abre el agente con este repositorio (en Claude Code: claude.ai/code o `claude` en la carpeta del repo).
2. El agente lee solo `AGENTS.md` y `CLAUDE.md`, y si tiene la skill `goslint-videos-v1` la carga. Si quieres la versión más reciente de la skill, súbela desde `skills/goslint-videos-v1/SKILL.md` a tus skills de claude.ai.
3. Si va a usar **ElevenLabs**, el entorno necesita el conector de ElevenLabs y salida de red a `elevenlabsusercontent.com` (en la nube: menú del entorno → Edit → Network access → Allowed domains). Los cambios de red solo aplican a sesiones nuevas.
4. Dile en qué **rama** trabajar. El agente hace commit y push ahí; no abre PR salvo que se lo pidas.

## 3. Cómo pedir las cosas

Sé concreto: qué video, qué momento (minuto:segundo) y qué quieres. Ejemplos que funcionan bien:

- «En el video principal, en 3:45, la foto corta a uno de los integrantes. Arréglalo.»
- «En el reel 2, entre 0:34 y 0:37 hay un silencio; las pausas deben ser de 1,5 s como máximo.»
- «Hazme un reel vertical sobre la Maratón Nacional con el estilo de los reels actuales.»
- «Prepara los guiones de los ganchos en el formato de ElevenLabs; los genero yo y los subo.»
- «Usa subagentes Haiku para hacer los reels 3 y 5 en paralelo.»

Para material nuevo (fotos, una presentación, un póster), **súbelo en la conversación** y di qué es: el agente lo usa como fuente de datos y no inventa lo que no esté ahí. Las fotos y recursos que sirvan a más de un video van a `commons/` (ver [`commons/README.md`](../commons/README.md)); pídele al agente que no duplique recursos entre proyectos.

## 4. Narración: dos caminos

**A. El agente genera la voz** (necesita el conector de ElevenLabs y créditos):
- Te dirá cuántos créditos va a gastar (1 crédito por carácter). Genera de una en una.
- Deja registro en `scripts/elevenlabs_ledger.json`.

**B. La generas tú a mano** (por ejemplo con el plan gratuito o si la red bloquea la descarga):
1. Pide: «dame los guiones en el formato de ElevenLabs».
2. En elevenlabs.io → Text to Speech: voz **Andres - Social Media Host**, modelo **Eleven v3/v4**; pega cada texto tal cual (con sus `[etiquetas]` y la grafía fonética, p. ej. «i ce pe ce»).
3. Descarga cada MP3 con el nombre que te indique (`s05.mp3`, `h3.mp3`…) en `<proyecto>/public/audio/vo/raw/`.
4. Haz commit y push y avisa al agente: él transcribe, alinea las marcas, ajusta duraciones y música.

**Escucha siempre la voz final.** El reconocimiento automático no detecta palabras mal pronunciadas que se parecen a la correcta (pasó con «creatinidad»).

## 5. Revisar lo que hizo el agente

1. `git pull` en tu PC.
2. Abre el Studio (`pnpm run studio`) o renderiza (`pnpm run render`, `pnpm run reels`).
3. Anota los problemas con **minuto:segundo** y descríbelos; si puedes, adjunta una captura. El agente corrige y vuelve a subir.
4. Para videos largos el render tarda (≈ 1 h el principal, ≈ 20 min cada reel en un equipo modesto). Mientras revisas fotogramas puedes usar `pnpm exec remotion still …` (ver la guía de edición).

## 6. Trabajo en paralelo con subagentes

Si pides «usa subagentes», el agente principal reparte tareas acotadas (un reel, los textos de publicación, una revisión) y luego **revisa e integra** el resultado. Funciona mejor cuando cada subagente tiene un archivo propio y un ejemplo a imitar. Los subagentes no hacen commits: el agente principal sí.

## 7. Errores frecuentes

| Síntoma | Causa probable | Qué pedir |
|---|---|---|
| ElevenLabs «busy» / «Unusual activity» | generaciones en paralelo en el plan gratuito | que genere de una en una, o generar a mano |
| No descarga los audios | la red del entorno bloquea `elevenlabsusercontent.com` | habilitar el dominio y abrir sesión nueva, o generar a mano |
| Texto pequeño en reels | se usó el cuadro horizontal reducido | maquetación vertical propia (estilo aprobado) |
| Silencios largos | se copiaron los respiros del video horizontal | tramos ajustados a la voz (`voiceParts`), pausas ≤ 1,5 s |
| Efecto que suena antes o después de la imagen | marcas desfasadas o tramo recortado | que lo derive de la misma marca que la animación |
