# Reglas de trabajo y control de versiones

Estas reglas son obligatorias para cualquier modificación que realices en este repositorio. Debes respetarlas durante toda la sesión y en futuras tareas.

## 1. Estructura de ramas

La estructura de ramas del proyecto debe organizarse de la siguiente manera:

```text
main
 └── develop
      ├── mascotas
      └── videos
```

### Configuración inicial

Si las ramas todavía no existen, realiza la siguiente configuración:

1. Actualizar la información del repositorio remoto.
2. Verificar que `main` esté actualizada.
3. Crear `develop` a partir de `main`.
4. Crear `mascotas` a partir de `develop`.
5. Crear `videos` a partir de `develop`.
6. Publicar las ramas en el repositorio remoto.

No sobrescribas ramas existentes ni elimines trabajo previo. Antes de crear una rama, verifica si ya existe y cuál es su estado.

### Reglas de selección de ramas

Debes trabajar exclusivamente en la rama correspondiente a la tarea:

| Tipo de trabajo | Rama |
|---|---|
| Desarrollo e integración general | `develop` |
| Funcionalidades, correcciones o modificaciones relacionadas con mascotas | `mascotas` |
| Generación, edición o implementación de videos | `videos` |

Reglas obligatorias:

- Si la tarea implica modificar cualquier funcionalidad relacionada con mascotas, debes cambiar a la rama `mascotas`.
- Si la tarea implica generar, modificar o implementar videos, debes cambiar a la rama `videos`.
- No mezcles cambios de diferentes áreas en una misma rama.
- No realices modificaciones directamente en `main`.
- No realices modificaciones directamente en `develop` cuando correspondan específicamente a las ramas `mascotas` o `videos`.
- Si una tarea involucra ambas áreas, mantén los cambios separados en sus respectivas ramas.
- Antes de comenzar cualquier tarea, verifica la rama actual mediante Git.
- Si existen cambios sin confirmar, no los descartes ni los sobrescribas al cambiar de rama.

## 2. Flujo de integración

Utiliza el siguiente flujo:

- `main` es la rama principal y debe mantenerse estable.
- `develop` es la rama de integración y recibe los cambios terminados.
- `mascotas` y `videos` son ramas de trabajo independientes que parten de `develop`.

Las Pull Requests deben seguir estas direcciones:

```text
mascotas ── PR ──> develop
videos   ── PR ──> develop
develop  ── PR ──> main
```

Reglas:

1. No integres cambios directamente sin utilizar Pull Requests.
2. Al terminar una tarea, publica los cambios en la rama correspondiente.
3. Crea una Pull Request hacia la rama base correspondiente.
4. No integres automáticamente una Pull Request si no se ha solicitado.
5. Antes de crear una PR, verifica que los cambios pertenezcan exclusivamente a la tarea realizada.
6. Evita incluir archivos temporales, dependencias innecesarias o modificaciones ajenas a la tarea.

## 3. Convención de commits

Todos los commits deben estar redactados en español y seguir estrictamente esta estructura:

```text
tipo(modulo): descripcion breve
```

### Tipos permitidos

Utiliza los siguientes tipos según la naturaleza del cambio:

| Tipo | Uso |
|---|---|
| `feat` | Agregar funcionalidades. |
| `fix` | Corregir errores. |
| `refactor` | Reestructurar código sin cambiar su comportamiento. |
| `style` | Realizar cambios de formato o estilo. |
| `docs` | Modificar documentación. |
| `test` | Agregar o modificar pruebas. |
| `chore` | Realizar tareas de mantenimiento. |
| `perf` | Mejorar el rendimiento. |
| `build` | Modificar procesos de compilación o dependencias. |
| `ci` | Modificar integración o despliegue continuo. |

### Módulos

El módulo debe identificar el área del proyecto afectada.

Algunos módulos existentes o posibles son:

- `pets`: funcionalidades relacionadas con mascotas.
- `video`: generación y procesamiento de videos.
- `resources`: recursos y archivos del proyecto.
- `auth`: autenticación y autorización.
- `users`: gestión de usuarios.
- `ui`: interfaz de usuario.
- `api`: servicios y endpoints.
- `database`: base de datos.
- `config`: configuración.
- `core`: funcionalidades centrales.

Si el cambio afecta un módulo diferente, utiliza un nombre breve, coherente y representativo.

### Reglas de redacción

- Escribe siempre en español.
- Comienza la descripción con un verbo en infinitivo.
- Utiliza descripciones breves y directas.
- No sobreexplique lo realizado.
- No incluyas explicaciones técnicas extensas en el mensaje del commit.
- No utilices descripciones genéricas como «realizar cambios» o «actualizar proyecto».
- Evita incluir detalles de implementación que no aporten valor al historial.
- Cada commit debe representar un conjunto coherente de cambios.

### Ejemplos correctos

```text
feat(pets): agregar registro de mascotas
fix(pets): corregir validación del formulario
refactor(pets): simplificar gestión de mascotas
feat(video): implementar generación de videos
fix(video): corregir procesamiento de archivos
docs(resources): actualizar documentación
chore(config): ajustar configuración del proyecto
test(api): agregar pruebas de endpoints
perf(video): optimizar procesamiento de videos
```

### Ejemplos incorrectos

```text
Se agregaron nuevas funcionalidades para mascotas.
feat(pets): se agregó un nuevo formulario que permite registrar mascotas con validaciones y diferentes campos.
fix(video): arreglos.
feat: mascotas.
```

## 4. Pull Requests

Todas las Pull Requests deben estar redactadas en español.

### Título

Utiliza títulos breves, descriptivos y relacionados con el propósito de los cambios.

Ejemplos:

```text
feat(pets): implementar gestión de mascotas
feat(video): agregar generación de videos
fix(pets): corregir validaciones del registro
```

### Descripción

La descripción debe incluir únicamente:

- Resumen breve del propósito de la PR.
- Principales cambios realizados.
- Pruebas o verificaciones ejecutadas, cuando corresponda.

No conviertas la descripción en un informe técnico extenso.

### Restricciones

- No incluyas enlaces a la sesión de Claude.
- No incluyas enlaces de seguimiento, referencias internas o identificadores de la sesión.
- No agregues información promocional ni comentarios innecesarios.
- No incluyas cambios que no pertenezcan a la tarea.
- No abras PR duplicadas para el mismo conjunto de cambios.

## 5. Reglas generales de trabajo

1. Antes de modificar archivos, inspecciona el estado del repositorio.
2. Identifica la rama adecuada para la tarea.
3. Revisa el contexto del código antes de implementar cambios.
4. Evita modificar archivos que no estén relacionados con el objetivo.
5. Mantén la arquitectura y las convenciones existentes.
6. No realices refactorizaciones adicionales que no sean necesarias para completar la tarea.
7. Ejecuta las pruebas pertinentes antes de confirmar los cambios.
8. Utiliza commits pequeños y coherentes.
9. Verifica el estado de Git antes de publicar los cambios.
10. No realices operaciones destructivas sin autorización explícita.

## 6. Comportamiento esperado al finalizar una tarea

Al completar cada tarea:

1. Verifica que estás trabajando en la rama correcta.
2. Comprueba los archivos modificados.
3. Ejecuta las pruebas correspondientes.
4. Genera los commits siguiendo la convención establecida.
5. Publica la rama en el repositorio remoto.
6. Crea la Pull Request hacia la rama correspondiente.
7. Informa brevemente qué se realizó, en qué rama y cuál es el estado de la PR.

**Prioridad absoluta:** mantener una separación clara entre las funcionalidades de mascotas y videos, preservar la estabilidad de `main` y mantener un historial de Git limpio, coherente y completamente redactado en español.
