# Módulo Proyectos — Implementación completa

**Fecha:** 2026-05-16
**Backend:** Spring Boot 4.0.6 + PostgreSQL + Flyway V29-V40
**Frontend:** React 19 + Vite + Tailwind + Framer Motion + react-markdown

---

## Resumen

Cuarto módulo completado tras Finanzas, Tareas y Hábitos. Implementa:

- **Proyectos** con state machine de 6 estados (ACTIVE / IN_PROGRESS / PAUSED / COMPLETED / CANCELLED / ARCHIVED)
- **Cierre de alcance**: cuando un proyecto está en IN_PROGRESS no se permiten vincular nuevas tareas
- **Progreso automático** calculado on-demand desde TaskRepository (tareas COMPLETED / total)
- **Iteraciones (sprints)** con número auto-incrementado por proyecto, única ACTIVE a la vez
- **Mini diario** (ProjectNote) con markdown
- **Links externos** (GitHub, Deploy, Docs, Figma…) con validación de URL
- **Stack tecnológico** con catálogo de ~50 tecnologías + autocomplete + permite custom
- **Categorías** sistema (5: Software Personal, Freelance, Open Source, Laboral, Personal) + propias
- **Integración con Tasks**: bloqueo IN_PROGRESS al crear/vincular, asignación a iteración

---

## Backend — 78 archivos

### Migraciones Flyway V29-V40 (12)

| V## | Tabla / contenido |
|---|---|
| V29 | `project_categories` |
| V30 | INSERT 5 categorías sistema |
| V31 | `tech_catalog` con GIN trigram index |
| V32 | INSERT 50 tecnologías comunes |
| V33 | `projects` con CHECK status + start≤due |
| V34 | `project_notes` con TEXT body + soft delete |
| V35 | `project_links` con CHECK type |
| V36 | `project_iterations` con UNIQUE (project, number) + PARTIAL UNIQUE WHERE status=ACTIVE |
| V37 | `project_techs` con UNIQUE (project, name) |
| V38 | Índices compuestos (user+status, user+deleted, due_date, etc.) |
| V39 | FK `tasks.project_id → projects(id) ON DELETE SET NULL` |
| V40 | FK `tasks.iteration_id → project_iterations(id) ON DELETE SET NULL` |

### Módulo `com.adminpersonal.project` (66 archivos)

- **7 entidades** (Project, ProjectCategory, TechCatalog, ProjectNote, ProjectLink, ProjectIteration, ProjectTech)
- **4 enums** (ProjectStatus, LinkType, IterationStatus, TechCategory)
- **8 excepciones** de dominio
- **6 repositories** con queries LEFT JOIN para sistema vs usuario
- **DTOs**: ~12 request + 8 response
- **Mappers**: 6
- **Services**: 8 (Project, ProjectStateMachine, ProjectProgress, ProjectCategory, ProjectNote, ProjectLink, ProjectTech, ProjectIteration)
- **Controllers**: 6 (Project, ProjectCategory, ProjectNote, ProjectLink, ProjectTech, ProjectIteration)

### Modificaciones a módulo Tasks

- `TaskRepository` — agregados métodos `countByProjectId`, `countCompletedByProjectId`, `countByIterationId`, `countCompletedByIterationId`, `clearIterationFromTasks`
- `TaskService` — inyecta `ProjectRepository` y `ProjectIterationRepository`, valida en `create`/`update`:
  - Si `projectId` viene → consulta status; rechaza si IN_PROGRESS/COMPLETED/CANCELLED/ARCHIVED con `ProjectInProgressException` (422)
  - Si `iterationId` viene → debe pertenecer al proyecto indicado
- `CreateTaskRequest` / `UpdateTaskRequest` — agregado campo `iterationId`
- `TaskResponse` + `TaskMapper` — incluye `iterationId`
- `TaskFilterRequest` + `TaskSpecification` — filtros `iterationId` y `backlogOnly`

### Endpoints expuestos (~30)

```
# Projects
GET    /api/projects?status=
GET    /api/projects/trash
GET    /api/projects/{id}
POST   /api/projects
PUT    /api/projects/{id}
POST   /api/projects/{id}/status
DELETE /api/projects/{id}
POST   /api/projects/{id}/restore

# Categories
GET    /api/projects/categories
POST   /api/projects/categories
PUT    /api/projects/categories/{id}
DELETE /api/projects/categories/{id}

# Notes (mini diary)
GET    /api/projects/{projectId}/notes
POST   /api/projects/{projectId}/notes
PUT    /api/projects/{projectId}/notes/{noteId}
DELETE /api/projects/{projectId}/notes/{noteId}

# Links
GET    /api/projects/{projectId}/links
POST   /api/projects/{projectId}/links
PUT    /api/projects/{projectId}/links/{linkId}
DELETE /api/projects/{projectId}/links/{linkId}

# Stack
GET    /api/projects/{projectId}/techs
POST   /api/projects/{projectId}/techs
DELETE /api/projects/{projectId}/techs/{techId}
GET    /api/projects/tech-catalog?query=

# Iterations
GET    /api/projects/{projectId}/iterations
POST   /api/projects/{projectId}/iterations
PUT    /api/projects/{projectId}/iterations/{iterationId}
DELETE /api/projects/{projectId}/iterations/{iterationId}
```

### State machine de Project (ProjectStateMachineService)

```
ACTIVE      → IN_PROGRESS | PAUSED | CANCELLED
IN_PROGRESS → ACTIVE | PAUSED | COMPLETED | CANCELLED
PAUSED      → ACTIVE | IN_PROGRESS
COMPLETED   → ARCHIVED | ACTIVE
CANCELLED   → ARCHIVED | ACTIVE
ARCHIVED    → ACTIVE
```

Efectos colaterales:
- `→ IN_PROGRESS`: registra `inProgressAt`
- `IN_PROGRESS → ACTIVE`: limpia `inProgressAt`
- `→ COMPLETED`: registra `completedAt`
- `COMPLETED|CANCELLED → ACTIVE`: limpia `completedAt`

---

## Frontend — 19 archivos nuevos

### Tipos + API + Store
- `types/project.types.ts` — todos los tipos TS
- `api/projects.api.ts` — todas las funciones API
- `stores/useProjectStore.ts` — Zustand UI state (statusFilter, activeTab)

### Componentes reusables (8)
- `components/projects/ProjectStatusBadge.tsx` — mapeo status → color + label español
- `components/projects/ProjectStatusActions.tsx` — botones de transiciones permitidas
- `components/projects/ProjectDetailSubNav.tsx` — sub-nav de tabs
- `components/projects/ProjectCard.tsx` — card del listado
- `components/projects/ProjectFormModal.tsx` — crear/editar
- `components/projects/ProjectCategoryManagerModal.tsx` — gestión categorías
- `components/projects/ProjectLinkIcon.tsx` — iconos por tipo de link
- `components/projects/CreateProjectTaskModal.tsx` — crear tarea con projectId pre-asignado
- `components/projects/IterationFormModal.tsx`

### Tab panels (6)
- `tabs/ProjectOverviewTab.tsx`
- `tabs/ProjectTasksTab.tsx` — vista lista (Kanban global ya existe en `/tasks/kanban`)
- `tabs/ProjectIterationsTab.tsx` — Backlog + iteraciones + tareas filtradas
- `tabs/ProjectNotesTab.tsx` — diario con react-markdown + remark-gfm
- `tabs/ProjectLinksTab.tsx`
- `tabs/ProjectStackTab.tsx` — autocomplete contra catálogo

### Páginas (3)
- `features/projects/pages/ProjectListPage.tsx` (`/projects`)
- `features/projects/pages/ProjectTrashPage.tsx` (`/projects/trash`)
- `features/projects/pages/ProjectDetailPage.tsx` (`/projects/:id`)

### Modificados (5)
- `types/task.types.ts` — agregado `iterationId` a TaskResponse, Create/UpdateTaskRequest; agregados `projectId`, `iterationId`, `backlogOnly` a TaskFilterState
- `api/tasks.api.ts` — `getTasks` propaga los nuevos filtros como query params
- `App.tsx` — registradas 3 rutas (`/projects/trash` antes que `/projects/:id`)
- `Sidebar.tsx` — item "Proyectos" activado (NavLink, ya no `disabled`)
- `index.css` — clase `.markdown-body` con estilos para output de ReactMarkdown

---

## Verificación

✅ **Frontend:** `npx tsc -b --noEmit` pasa sin errores
✅ **Frontend build:** `npx vite build` pasa
⚠️ **Backend:** no compilable localmente (Maven no instalado). Probar al arrancar IDE.

### Bug del selector reaplicado proactivamente
- `ProjectCategoryRepository.findAllForUser` usa LEFT JOIN explícito (igual fix que `CategoryRepository` y `HabitCategoryRepository`)

---

## Decisiones técnicas tomadas

| # | Decisión |
|---|----------|
| 1 | **Progreso on-demand**: `ProjectProgressService` calcula desde TaskRepository en cada request. NO se persiste en `projects.progress_percent`. Evita consistencia eventual al precio de un par de COUNT() extra |
| 2 | **TaskService → ProjectRepository directo**: el architecture.plan permite repos cross-module. Evita dependencia circular ProjectService → TaskService → ProjectService |
| 3 | **Bloqueo IN_PROGRESS**: validado en backend (`TaskService.validateProjectAvailableForNewTask`) Y en frontend (botón deshabilitado en ProjectTasksTab) |
| 4 | **Tab Tareas con vista lista solo**: el Kanban global ya existe en `/tasks/kanban`; el tab interno deja la lista para mantener scope tight |
| 5 | **Inline title editing**: solo el nombre se edita inline en el detail. El resto va por modal Editar |
| 6 | **Markdown sin `@tailwindcss/typography`**: agregada clase `.markdown-body` en `index.css` para estilizar el output de ReactMarkdown sin instalar dependencia extra |
| 7 | **Eliminar iteración → tareas al backlog**: `ProjectIterationService.delete()` ejecuta `taskRepository.clearIterationFromTasks(iterationId)` antes del DELETE; las tareas pierden `iteration_id` pero conservan `project_id` |
| 8 | **Notas con soft delete pero NO restaurable**: tienen `deletedAt` pero no hay endpoint de restore (spec §F5 decisión 5) |

---

## Pendientes (v2 / fuera de scope)

- **Vista Kanban dentro del proyecto** (filtrada por projectId): puede agregarse reutilizando el componente Kanban existente
- **Vista Gantt dentro del proyecto** (filtrada por projectId): mismo enfoque, reusar gantt-task-react
- **Filtro Kanban por iteración**: agregable como query param en `/tasks/kanban`
- **Dashboard global**: widgets de Proyectos activos con due date próxima + proyectos pausados > 30 días (spec §F10)
- **Editor markdown con preview**: actualmente textarea simple; mejorable con preview side-by-side

---

## Cómo probar (al arrancar backend desde IDE)

### 1. Verificar categorías
```bash
GET /api/projects/categories
# Debe devolver ≥ 5 categorías sistema (Software Personal, Freelance, ...)
```

### 2. Verificar catálogo de tecnologías
```bash
GET /api/projects/tech-catalog?query=react
# Debe devolver React, React Native, etc.
```

### 3. Crear proyecto + tarea vinculada
```bash
POST /api/projects                  → crea proyecto ACTIVE
POST /api/tasks                     → crea tarea con projectId
GET  /api/projects/{id}             → progressPercent = 0%, totalTasks = 1, completedTasks = 0
POST /api/tasks/{taskId}/status     → cambia a COMPLETED
GET  /api/projects/{id}             → progressPercent = 100%
```

### 4. Bloqueo IN_PROGRESS
```bash
POST /api/projects/{id}/status     → status=IN_PROGRESS
POST /api/tasks { projectId: id, ... } → debe responder 422 PROJECT_IN_PROGRESS
```

### 5. Iteraciones
```bash
POST /api/projects/{id}/iterations           → crea Iter #1 PLANNED
PUT  /api/projects/{id}/iterations/{iterId}  → status=ACTIVE
POST /api/projects/{id}/iterations           → crea Iter #2 PLANNED
PUT  /api/projects/{id}/iterations/{iter2}   → status=ACTIVE → debe responder 409 (solo 1 ACTIVE)
POST /api/tasks { projectId, iterationId }   → tarea en iteración
DELETE /api/projects/{id}/iterations/{iter1} → tarea vuelve al backlog (iteration_id=null)
```

### 6. Frontend
```powershell
cd frontend
npm run dev
```
- Abrir `/projects` — debería verse listado con filtro por status
- Crear proyecto desde modal
- Click en card → `/projects/{id}` con tabs
- Tab Iteraciones: crear iteración, activarla, vincular tareas
- Tab Diario: agregar nota con markdown (negritas, listas, código)
- Tab Stack: autocomplete contra catálogo, agregar tecnologías
- Tab Links: agregar link GitHub, ver con icon
- Botones de transición de estado
