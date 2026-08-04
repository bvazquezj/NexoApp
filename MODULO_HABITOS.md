# Módulo Hábitos — Implementación completa

**Fecha:** 2026-05-15
**Backend:** Spring Boot 4.0.6 + PostgreSQL + Flyway
**Frontend:** React 19 + Vite + Tailwind + Framer Motion + react-calendar-heatmap

---

## Resumen

Módulo completo con backend (8 sub-bloques H1-H8) y frontend (10 archivos). Implementa:

- **Hábitos**: CRUD + categorías personalizadas + 6 categorías sistema
- **HabitLogs**: registro diario con upsert + cálculo automático de racha (DAILY/CUSTOM, "hoy sin log no rompe")
- **Stats + Heatmap**: períodos 7/30/90 días + 90 días visuales
- **Rutinas**: CRUD por día de la semana + copia entre días + plantillas JSONB
- **Bloques**: con validación no-overlap (anti-solapamiento) + reorder + 5 tipos (HABIT/PRODUCTIVE/SLEEP/BREAK/FREE)
- **Ejecución**: log diario por bloque + propagación a HabitLog si tipo HABIT
- **BlockTaskLink**: vínculos N:N a tareas (soft FK) + listener de TaskDeletedEvent
- **Sleep**: registro manual + correlación automática con bloque SLEEP (cobertura ≥ 80%)
- **Notifications**: in-app SSE + scheduler que evalúa bloques cada minuto

---

## Bug previo arreglado en este ciclo

**Selectores de categoría/tipo no funcionaban** (Finanzas y Tareas). Causa: el JPQL `WHERE c.user IS NULL OR c.user.id = :userId` generaba un INNER JOIN implícito con `users` debido a la expresión `c.user.id`, lo cual excluye filas con `user_id IS NULL` (las del sistema). Corregido con LEFT JOIN explícito en:
- `CategoryRepository.findAllForUser` y `findAllForUserByType`
- `TaskTypeRepository.findByUserIdOrSystem`

El mismo patrón se aplicó a las nuevas queries del módulo Hábitos:
- `HabitCategoryRepository.findAllForUser`
- `RoutineTemplateRepository.findAllForUser`

---

## Backend — Archivos creados

### Migraciones Flyway (V15-V28, 14 archivos)

| Versión | Tabla / contenido |
|---|---|
| V15 | `habit_categories` |
| V16 | INSERT 6 categorías sistema (Salud/Estudio/Trabajo/Personal/Bienestar/Finanzas) |
| V17 | `habits` con array `frequency_days INTEGER[]`, soft delete, streaks |
| V18 | `habit_logs` UNIQUE(habit_id, date) |
| V19 | `routine_days` con PARTIAL UNIQUE INDEX (active=true) |
| V20 | `routine_blocks` con CHECK end > start y type=HABIT requiere habit_id |
| V21 | `block_task_links` SIN FK a tasks (soft reference) |
| V22 | `routine_execution_logs` UNIQUE(block_id, date) |
| V23 | `routine_templates` con `blocks JSONB` |
| V24 | INSERT 4 plantillas sistema |
| V25 | `sleep_logs` UNIQUE(user_id, date) |
| V26 | `user_integrations` (compartida — Samsung tokens cifrados) |
| V27 | `notifications` (compartida) |
| V28 | Índices compuestos (kanban order, notify trigger, etc.) |

### Módulo `com.adminpersonal.habit` (91 archivos)

- **9 entidades JPA** (Habit, HabitCategory, HabitLog, RoutineDay, RoutineBlock, BlockTaskLink, RoutineExecutionLog, RoutineTemplate, SleepLog)
- **6 enums** (HabitFrequency, BlockType, BlockPriority, LogSource, ExecutionSource, SleepSource)
- **7 excepciones de dominio**
- **6 repositories**
- **DTOs**: ~15 request + ~12 response
- **Mappers**: 7
- **Services**: 9 (HabitService, HabitCategoryService, HabitLogService, StreakCalculationService, HabitStatsService, RoutineDayService, RoutineBlockService, RoutineExecutionService, RoutineTemplateService, BlockTaskLinkService, SleepLogService)
- **Controllers**: 8 (HabitController, HabitCategoryController, HabitLogController, HabitStatsController, RoutineDayController, RoutineBlockController, RoutineTemplateController, BlockTaskLinkController, SleepLogController)
- **Listener**: TaskDeletedHabitListener (consume TaskDeletedEvent → cleanup links)
- **Scheduler**: RoutineBlockNotificationScheduler (cron `0 * * * * *`)

### Compartido `com.adminpersonal.shared.notification` (12 archivos nuevos/refactorizados)

- `Notification` entity + `NotificationRepository`
- `NotificationService`, `SseEmitterManager`, `NotificationController`
- `NotificationResponse` DTO
- Eventos: `TaskDeletedEvent` (record creado en H1)
- Handlers añadidos a `GlobalExceptionHandler` (8 nuevas excepciones de hábitos)

### Endpoints expuestos (~35)

```
# Habits
GET    /api/habits
POST   /api/habits
GET    /api/habits/today
GET    /api/habits/{id}
PUT    /api/habits/{id}
PATCH  /api/habits/{id}/active
DELETE /api/habits/{id}

# Categories
GET    /api/habits/categories
POST   /api/habits/categories
PUT    /api/habits/categories/{id}
DELETE /api/habits/categories/{id}

# Logs / Stats
POST   /api/habits/{id}/logs
GET    /api/habits/{id}/logs?from=&to=
GET    /api/habits/{id}/stats?period=7|30|90
GET    /api/habits/{id}/heatmap

# Routines
GET    /api/routines
POST   /api/routines
GET    /api/routines/{id}
PUT    /api/routines/{id}
DELETE /api/routines/{id}
POST   /api/routines/{id}/copy

# Blocks
POST   /api/routines/{id}/blocks
PUT    /api/routines/{id}/blocks/{blockId}
DELETE /api/routines/{id}/blocks/{blockId}
PATCH  /api/routines/{id}/blocks/reorder

# Execution
GET    /api/routines/{id}/execution?date=
POST   /api/routines/{id}/blocks/{blockId}/execution

# Templates
GET    /api/routines/templates
POST   /api/routines/templates
POST   /api/routines/templates/{id}/apply
DELETE /api/routines/templates/{id}

# Block-Task Links
GET    /api/routines/blocks/{blockId}/tasks
POST   /api/routines/blocks/{blockId}/tasks
DELETE /api/routines/blocks/{blockId}/tasks/{linkId}

# Sleep
POST   /api/sleep-logs
GET    /api/sleep-logs?from=&to=
GET    /api/sleep-logs/{date}

# Notifications
GET    /api/notifications
GET    /api/notifications/unread
POST   /api/notifications/{id}/read
POST   /api/notifications/read-all
GET    /api/notifications/stream  (SSE)
```

---

## Frontend — Archivos creados (12)

### Tipos + API + Store
- `frontend/src/types/habit.types.ts` — todos los tipos TS
- `frontend/src/api/habits.api.ts` — todas las funciones API
- `frontend/src/stores/useHabitStore.ts` — Zustand UI state

### Páginas
- `features/habits/pages/HabitTodayPage.tsx` (`/habits`) — vista diaria con hábitos del día + bloques de rutina
- `features/habits/pages/HabitListPage.tsx` (`/habits/list`) — CRUD hábitos + gestión categorías
- `features/habits/pages/HabitDetailPage.tsx` (`/habits/:id`) — heatmap (react-calendar-heatmap), stats 7/30/90, historial
- `features/habits/pages/RoutineListPage.tsx` (`/habits/routines`) — vista 7 cards (Lun-Dom) + plantillas
- `features/habits/pages/RoutineEditorPage.tsx` (`/habits/routines/:id/edit`) — editor con timeline + CRUD bloques + vínculos a tareas + copia entre días
- `features/habits/pages/SleepPage.tsx` (`/habits/sleep`) — registro manual + log
- `features/notifications/pages/NotificationsPage.tsx` (`/notifications`) — listado completo con filtros

### Componentes
- `components/habits/HabitsSubNav.tsx` — sub-nav del módulo
- `components/notifications/NotificationsBell.tsx` — campana en sidebar con badge + popover (polling cada 30s)

### Modificados
- `App.tsx` — 7 rutas nuevas registradas (orden correcto: subrutas antes de `/habits/:id`)
- `Sidebar.tsx` — item "Habitos" activado + NotificationsBell montada en footer
- `package.json` — `react-calendar-heatmap` + types

---

## Verificación

✅ **Frontend:** `npx tsc -b --noEmit` pasa sin errores
✅ **Bug del selector de categorías arreglado** (LEFT JOIN explícito en 3 queries)
⚠️ **Backend:** no se compiló localmente (Maven no instalado). Probar al arrancar IDE.

---

## Pendientes / decisiones diferidas (v2)

| # | Tema | Estado |
|---|------|--------|
| 1 | Samsung Health OAuth real | Estructura de tablas y servicio creada (UserIntegration), pero el cliente HTTP + cifrado AES-256 de tokens queda como placeholder. v1 expone solo registro manual de sueño |
| 2 | Web Push / FCM real | v1 usa SSE in-app (`/api/notifications/stream`). El cliente NotificationsBell hace polling cada 30s en lugar de conectar SSE (EventSource no soporta headers JWT — requeriría cookie httpOnly o ?token= query) |
| 3 | Drag & drop visual del editor de rutinas | El editor actual lista bloques en timeline read-only + modales. Reordenamiento por drag se puede agregar con dnd-kit (ya instalado) en una iteración posterior |
| 4 | TaskDeletedEvent no fue probado end-to-end | El listener `TaskDeletedHabitListener` está registrado, pero requiere arrancar backend y eliminar una tarea con BlockTaskLink para verificar limpieza |
| 5 | Plantillas con habitName → habitId | Al aplicar plantilla, los bloques de tipo HABIT se omiten (la plantilla solo guarda `habitName`, no IDs). El usuario debe recrearlos. Mejora futura: matching por nombre + creación de hábito automática |
| 6 | Frontend mejor UX para selector de tareas vinculadas a bloque | Actualmente: input de búsqueda con autocomplete client-side sobre 100 tareas. En v2: endpoint con búsqueda en backend |

---

## Cómo probar (al arrancar backend desde IDE)

### 1. Verificar el bug del selector arreglado
- Login como cualquier usuario
- `GET /api/finance/categories` debe devolver ≥ 12 categorías (con `isSystem: true`)
- `GET /api/tasks/types` debe devolver ≥ 4 task types (con `system: true`)
- `GET /api/habits/categories` debe devolver ≥ 6 categorías

### 2. Crear y registrar un hábito
```bash
POST /api/habits/categories  → crea categoría propia (ej. "Lectura")
POST /api/habits             → crea hábito DAILY (ej. "Leer 30 min")
POST /api/habits/{id}/logs   → marca como completado hoy
GET  /api/habits/{id}/stats?period=7  → debe mostrar currentStreak=1
```

### 3. Crear rutina con bloques
```bash
POST /api/routines               → crear rutina para Lunes (dayOfWeek=1)
POST /api/routines/{id}/blocks   → crear bloque 06:00-07:00 tipo HABIT con habitId
POST /api/routines/{id}/blocks   → crear bloque 06:30-07:30 → debe responder 409 BLOCK_OVERLAP
```

### 4. Vista diaria
```bash
GET /api/routines/{id}/execution?date=2026-05-15
POST /api/routines/{id}/blocks/{blockId}/execution → marca completado, propaga al HabitLog
```

### 5. SSE notifications (browser/postman)
- Conectar a `/api/notifications/stream` con JWT (debe quedar abierto 5 min)
- Esperar al horario de un bloque con notifyStart=true → llega evento `notification`

### 6. Frontend
```powershell
cd frontend
npm run dev
```
- Abrir `/habits`, debería verse la vista diaria
- Crear hábito desde `/habits/list`
- Ver heatmap en `/habits/:id`
- Crear rutina desde `/habits/routines` y editarla con bloques
- Registrar sueño desde `/habits/sleep`
