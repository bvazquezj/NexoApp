# Guía de uso: proyectos con IA y SDD (GitHub Spec Kit)

Esta guía describe un flujo ordenado para crear y mantener software con asistentes de IA (**Claude Code**, Cursor, Copilot u otros agentes), alineado con **Spec-Driven Development (SDD)** y el toolkit oficial de GitHub: **[Spec Kit](https://github.com/github/spec-kit)**.

La idea central del SDD es invertir el orden habitual: **primero una especificación clara y revisable**, después el código. La especificación actúa como contrato y fuente de verdad; el agente implementa, prueba y refina contra ese contrato, en lugar de “vibe coding” sin límites.

---

## Qué es SDD y por qué importa

| Enfoque | Riesgo | SDD mitiga… |
|--------|--------|-------------|
| Pedir código directo a la IA | Requisitos ambiguos, refactors erráticos, deuda técnica rápida | Ambigüedad con requisitos y criterios de aceptación explícitos |
| Contexto solo en el chat | Se pierde el hilo entre sesiones | Artefactos versionados en el repo (`specs/`, planes, tareas) |
| Sin principios de equipo | Estilos inconsistentes | `constitution` + convenciones explícitas |

**SDD no sustituye el flujo de Git con ramas** (por ejemplo [GitHub Flow](https://docs.github.com/es/get-started/using-github/github-flow)): encaja *dentro* de cada feature: especificar → planificar → tareas → implementar → PR → merge.

---

## Requisitos previos

1. **Repositorio Git** (local y remoto en GitHub recomendado).
2. **Python + [uv](https://github.com/astral-sh/uv)** para instalar el CLI oficial de Spec Kit (**Specify**).  
   GitHub deja claro que los paquetes homónimos en PyPI no oficiales no deben usarse; la instalación debe ir contra el repo de Spec Kit (ver enlace arriba).
3. **Agente de IA** en el directorio del proyecto (Claude Code, Cursor, Copilot, etc.) con los *slash commands* de Spec Kit disponibles (tras `specify init` con el proveedor adecuado).

Instalación típica del CLI (sustituye `vX.Y.Z` por la última [release](https://github.com/github/spec-kit/releases)):

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@vX.Y.Z
specify version
```

Inicializar un proyecto **nuevo** o **existente**:

```bash
specify init nombre-del-proyecto --ai copilot
# o en carpeta actual:
specify init . --ai copilot
# o:
specify init --here --ai copilot
```

El flag `--ai` adapta plantillas y comandos al agente (p. ej. `copilot`). Si usas otro, revisa la documentación de Spec Kit para la variante correcta.

Verificar entorno:

```bash
specify check
```

---

## Flujo recomendado (orden estricto)

Los agentes suelen exponer Spec Kit como comandos **`/speckit.*`**. En algunos entornos (p. ej. Codex CLI en modo skills) el prefijo puede variar (`$speckit-*`): consulta la ayuda de tu herramienta.

### Fase 0 — Visión y contexto humano (`PROJECT.md`)

Antes o en paralelo con Spec Kit, conviene un **`PROJECT.md`** (o equivalente) **breve y estable**: objetivos, módulos, stack, UI, alcance por fases. Sirve como **ventana de contexto** para cualquier sesión de IA y para personas que lean el repo sin abrir los specs técnicos.

Prompt de ejemplo para generarlo de forma guiada:

```text
Quiero crear un archivo PROJECT.md para una aplicación de [DESCRIPCIÓN].

Antes de generarlo, hazme todas las preguntas necesarias para definir:
- objetivos
- funcionalidades
- stack
- estilo de UI
- alcance del proyecto

Haz las preguntas paso a paso.
```

**Buena práctica:** `PROJECT.md` = *qué es el producto y hacia dónde va*; las carpetas/archivos que genere Spec Kit = *cómo se implementa cada entrega*.

### Fase 1 — Constitución (`/speckit.constitution`)

Define **principios no negociables**: calidad, pruebas, seguridad, UX, rendimiento, accesibilidad, estilo de commits, etc. Todo lo que venga después debe alinearse con esto.

Ejemplo:

```text
/speckit.constitution Create principles focused on code quality, testing standards, user experience consistency, and performance requirements
```

### Fase 2 — Especificación (`/speckit.specify`)

Describe **qué** y **por qué**, en lenguaje de producto. **Evita** fijar aquí el stack completo si quieres separar “negocio” de “arquitectura”.

Ejemplo:

```text
/speckit.specify Build an application that can help me organize my photos in separate photo albums. Albums are grouped by date and can be re-organized by dragging and dropping on the main page. Albums are never in other nested albums. Within each album, photos are previewed in a tile-like interface.
```

Incluye **criterios de aceptación** observables (qué ve el usuario, qué errores son válidos, límites de datos).

### Fase 3 — Plan técnico (`/speckit.plan`)

Aquí defines **stack, arquitectura, almacenamiento, integraciones**. Debe ser coherente con `PROJECT.md` y la constitución.

Ejemplo:

```text
/speckit.plan The application uses Vite with minimal number of libraries. Use vanilla HTML, CSS, and JavaScript as much as possible. Images are not uploaded anywhere and metadata is stored in a local SQLite database.
```

### Fase 4 — Tareas (`/speckit.tasks`)

Descompone el plan en **tareas pequeñas y verificables**. Suele invocarse sin texto extra o con ajustes puntuales según tu agente:

```text
/speckit.tasks
```

### Fase 5 — Implementación (`/speckit.implement`)

El agente ejecuta las tareas contra el plan y la spec. Revisa diffs como en cualquier PR humano.

```text
/speckit.implement
```

---

## Integración con Git y revisiones

1. **Rama por feature** (`feature/…` o el estándar del equipo).
2. **Commits atómicos** con mensajes claros (convención acordada en la constitución).
3. **Pull Request** que enlace o resuma cambios respecto a la spec afectada.
4. **CI** (lint, tests, build) antes de merge; la IA no sustituye la pipeline.

Si el código existió antes que Spec Kit, existen extensiones de comunidad como *Brownfield Bootstrap* (revisar siempre el código de extensiones no oficiales antes de usarlas).

---

## Buenas prácticas de código con IA

- **Spec primero, código después.** Si la spec es vaga, el código será adivinanza.
- **Mantén `PROJECT.md` y la constitución actualizados** cuando cambien objetivos o reglas globales.
- **Tareas pequeñas:** mejor muchos pasos comprobables que un monolito “implementa todo”.
- **Revisión humana obligatoria** en seguridad, datos sensibles, auth y dependencias.
- **No confíes en dependencias sugeridas** sin verificar licencia, mantenimiento y supply chain.
- **Tests como contrato:** donde la constitución exija tests, pídelos en la spec o en el plan, no solo en el chat.
- **Evita prompts gigantes:** referencia archivos del repo (`@archivo`) en lugar de pegar todo el contexto.

---

## Ejemplo de implementación: módulo de finanzas (prompts por fase)

Este ejemplo replica SDD **sin mezclar fases**: en cada sesión o mensaje solo corresponde una fase. Crea las carpetas `specs/`, `plans/` y `docs/` en el repo si aún no existen.

### Mensaje inicial de sesión (contexto y reglas)

Úsalo al abrir el trabajo en un módulo; puedes adjuntar `@PROJECT.md` en Cursor o equivalente.

```text
Lee PROJECT.md y entiende el contexto del sistema.

Vamos a trabajar en el módulo de finanzas.
Sigue un enfoque Spec-Driven Development (SDD).

Trabajaremos por fases:
1. Especificación
2. Plan técnico
3. Implementación
4. Documentación

No mezcles fases.
```

### Fase 1 — Especificación (solo producto; sin código)

**Rol:** product manager y arquitecto funcional.  
**Salida:** Markdown listo para guardarse en `specs/finance.md`.

```text
Actúa como product manager y arquitecto funcional.

Define la especificación completa del módulo de finanzas para un sistema de administración personal.

Incluye:

## Objetivo
Qué problema resuelve el módulo

## Funcionalidades
- Registro de ingresos
- Registro de gastos
- Categorías (ej: comida, transporte, etc.)
- Balance total
- Filtros por fecha
- Resumen mensual

## Modelo de datos (conceptual, no código)
Define entidades y atributos (ej: Transaction, Category)

## Reglas de negocio
- validaciones
- restricciones
- cálculos (balance, totales)

## Casos de uso
Describe flujos reales de usuario

## Criterios de aceptación
Define cómo saber que cada funcionalidad está bien implementada

NO generes código.
Entrega el resultado en formato Markdown listo para guardarse en /specs/finance.md
```

### Fase 2 — Plan técnico (solo arquitectura; sin código)

**Prerrequisito:** tener `specs/finance.md` en el repo y referenciarlo (`@specs/finance.md`).  
**Salida:** Markdown listo para `plans/finance.plan.md`.

```text
Actúa como arquitecto de software senior.

Con base en finance.md, diseña el plan técnico para implementar el módulo de finanzas.

Incluye:

## Arquitectura backend (Spring Boot)
- estructura de paquetes
- controllers
- services
- repositories

## Modelo de datos (técnico)
- entidades JPA
- relaciones

## Endpoints API
Define rutas REST (GET, POST, PUT, DELETE)

## Validaciones y lógica
Dónde se implementa cada regla

## Consideraciones técnicas
- manejo de fechas
- precisión de dinero
- posibles problemas

## Flujo general
Desde frontend → backend → base de datos

NO generes código.
Entrega en Markdown listo para /plans/finance.plan.md
```

### Fase 3 — Implementación (código)

**Prerrequisito:** `@specs/finance.md` y `@plans/finance.plan.md`. No pidas en el mismo mensaje documentación ni frontend.

```text
Actúa como desarrollador backend experto en Spring Boot.

Implementa el módulo de finanzas basándote estrictamente en:
- finance.md
- finance.plan.md

Genera:

## Backend
- Entities (JPA)
- Repositories
- Services
- Controllers

Sigue buenas prácticas:
- arquitectura limpia
- uso de DTOs
- validaciones
- separación de capas

Incluye comentarios en el código para explicar decisiones importantes.

NO inventes funcionalidades fuera del spec.
```

### Fase 4 — Documentación de implementación (sin repetir código)

**Prerrequisito:** código ya fusionado o presente en el workspace; referencia spec, plan y rutas de archivos clave.

```text
Actúa como ingeniero senior documentando una implementación.

Con base en el código generado del módulo de finanzas, crea un documento de implementación.

Incluye:

## Qué se implementó
Resumen claro del módulo

## Decisiones técnicas
Por qué se eligieron ciertas estructuras o enfoques

## Problemas encontrados
Errores, edge cases o dificultades

## Soluciones aplicadas
Cómo se resolvieron los problemas

## Mejoras futuras
Qué se podría optimizar o agregar

NO repitas el código.
Entrega en Markdown listo para /docs/finance.impl.md
```

### (Opcional) Frontend — en una fase aparte

Solo después de tener API estable o mocks acordados; no mezclar con la fase de implementación backend.

```text
Actúa como frontend developer experto.

Crea la interfaz del módulo de finanzas:
- dashboard financiero
- lista de transacciones
- formulario de ingreso/gasto

Usa:
- React
- Tailwind
- diseño moderno tipo app premium

Incluye ideas de UX y microinteracciones.
```

### Secuencia y archivos esperados

1. **Prompt spec** → guardas la salida en `specs/finance.md`
2. **Prompt plan** → guardas la salida en `plans/finance.plan.md`
3. **Prompt implement** → código real en el árbol del proyecto (según el plan)
4. **Prompt doc** → guardas la salida en `docs/finance.impl.md`

---

## Aprendizaje y referencias oficiales

- Blog GitHub: [Spec-driven development with AI](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)
- Repositorio: [github/spec-kit](https://github.com/github/spec-kit)
- Guía detallada en el repo: archivo `spec-driven.md` (proceso paso a paso)
- Microsoft Learn (intro greenfield): [Spec-Driven Development con GitHub Spec Kit](https://learn.microsoft.com/es-es/training/modules/spec-driven-development-github-spec-kit-greenfield-intro/)

---

## Resumen visual del flujo

```text
PROJECT.md (visión)     →  referencia constante para el agente y el equipo
        ↓
/speckit.constitution   →  reglas y calidad
        ↓
/speckit.specify        →  qué / por qué / criterios de aceptación
        ↓
/speckit.plan           →  cómo (stack y arquitectura)
        ↓
/speckit.tasks          →  desglose accionable
        ↓
/speckit.implement      →  código + tests según constitución
        ↓
PR + revisión + CI      →  merge cuando cumpla la spec
```

Con este orden reduces retrabajo, alineas a la IA con criterios objetivos y mantienes el repositorio como **fuente de verdad** compartida entre humanos y agentes.
