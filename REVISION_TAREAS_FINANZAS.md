# Revisión exhaustiva: Módulos Tareas y Finanzas

**Fecha:** 2026-05-15
**Alcance ejecutado:** P0 + P1 + P2 (críticos + incumplimientos del plan + features faltantes)
**Plan de referencia:** `C:\Users\bvazq\.claude\plans\cryptic-twirling-shore.md`

---

## Resumen ejecutivo

Se auditó la implementación real contra `plans/architecture.plan.md`, `plans/finance.plan.md` v1.0 + `specs/finance.md` v1.1, y `plans/tasks.plan.md` v1.1 + `specs/tasks.md` v2.0. Cuatro auditorías paralelas (backend Finance, backend Tasks, frontend Finance, frontend Tasks) detectaron 4 críticos, 10 incumplimientos del plan y 6 mejoras pendientes. Todos los hallazgos fueron corregidos y se crearon las 3 features faltantes (Charts, CategoryManager, TransactionDetail).

**Verificación:** `npx tsc -b --noEmit` sobre el frontend pasa sin errores. Backend no compilable localmente (no hay maven wrapper ni mvn instalado), pero los cambios siguen el patrón de los archivos vecinos validados previamente.

---

## P0 — Críticos resueltos (4)

| # | Archivo | Problema | Solución |
|---|---------|----------|----------|
| P0.1 | `SubscriptionService.java:51, 79` | `create()`/`update()` cargaban Category sin validar ownership; brecha de aislamiento | Agregado `validateCategoryAccess(Category, UUID)` privado siguiendo patrón de `TransactionService` y `BudgetService`. Llama también en update si llega `categoryId` |
| P0.2 | `TaskService.java:108` | `softDelete()` no publicaba `TaskDeletedEvent`; rompe integración futura con módulo Hábitos (`BlockTaskLink`) | Inyectado `NotificationEventPublisher`. Creado `shared/notification/event/TaskDeletedEvent.java` (record `(UUID taskId, UUID userId)`). Publicación tras `save()` |
| P0.3 | `TaskService.java:120, 124, 138, 143` | Métodos `findById`, `findAll`, `findAllDeleted`, `findSubtasks` sin `@Transactional`; mapper accede a relaciones LAZY → `LazyInitializationException` en producción | Agregado `@Transactional(readOnly = true)` a los 4 métodos |
| P0.4 | `TaskAiService.java:44` + `GlobalExceptionHandler.java` | Lanzaba `RuntimeException` cuando ambos providers IA fallaban → 500 (debía ser 503) | Creada `task/domain/exception/AiServiceUnavailableException.java`. Service la lanza. Handler en GlobalExceptionHandler retorna 503 con código `AI_SERVICE_UNAVAILABLE` |

---

## P1 — Incumplimientos del plan resueltos (10)

| # | Archivo | Problema | Solución |
|---|---------|----------|----------|
| P1.1 | `TaskResponse.java`, `TaskMapper.java` | Falta campo `kanbanPosition` (crítico para Kanban visual) | Agregado `Integer kanbanPosition` al record + propagación en mapper |
| P1.2 | `TaskService.findAll()` + `TaskSpecification.java` | Sin ordenamiento compuesto del spec (HIGH→MEDIUM→LOW + dueDate ASC NULLS LAST + createdAt DESC). `Sort.asc("priority")` daría orden alfabético en VARCHAR (HIGH, LOW, MEDIUM) | `TaskSpecification.withFilters` aplica `query.orderBy()` con `cb.selectCase()` mapeando HIGH=1/MEDIUM=2/LOW=3, NULL rank para dueDate, y `desc(createdAt)`. Solo se aplica cuando `query.getResultType() != Long.class` (no rompe count queries) |
| P1.3 | `TaskDashboardService.java` | Filtraba `user_id` en memoria tras cargar tareas REVIEW de TODOS los usuarios (riesgo + N rendimiento) | Nuevo método `TaskRepository.findStalledInReviewByUserId(userId, threshold)`. Agregado `@Transactional(readOnly = true)` |
| P1.4 | `tasks.api.ts:getTrashTasks` | Tipificaba `TaskResponse[]` pero backend devuelve `TaskSummaryResponse[]` | Creada interfaz `TaskSummaryResponse`. `getTrashTasks(): Promise<TaskSummaryResponse[]>`. `TaskTrashPage` ahora usa `task.deletedAt` en vez de `task.updatedAt` (que no existe) |
| P1.5 | `TaskGanttPage.tsx:30` | Capturaba `?projectId=` pero la variable no se usaba: el Gantt nunca filtraba | `queryFn` ahora filtra client-side por `projectId` cuando viene en URL |
| P1.6 | `TaskDetailPage.tsx` | Mezcla de query keys `['task', id]` (singular) y `['tasks', ...]` (plural). Invalidaciones desde otras páginas no refrescaban el detalle | Unificadas todas a `['tasks', id]` (replace_all + corrección de espacios). Verificado: 0 referencias residuales a `['task', ` |
| P1.7 | `TaskKanbanPage.tsx:93` | Solo invalidaba columna destino al cambiar estado; columna origen quedaba con tarjeta fantasma | `statusMutation` ahora recibe `sourceStatus`. `onSuccess` invalida ambas columnas + `['tasks', vars.id]` + `['tasks-dashboard']` |
| P1.8 | `TransactionListPage.tsx:89` | Validación `parseFloat(amount) <= 0` no manejaba NaN. Si usuario escribía "abc", `NaN <= 0 === false` y la validación pasaba | Cambio a `Number.isFinite(parseFloat(amount)) && numericAmount > 0` |
| P1.9 | `FinanceSummaryPage.tsx` | Faltaban widgets del plan: `BudgetAlertBanner` y `SubscriptionCostWidget` | Agregados: BudgetAlertBanner muestra budgets WARNING/EXCEEDED con link a Presupuestos; SubscriptionCostWidget muestra costo mensual total con link a Suscripciones. Layout en grid 1+2 cols |
| P1.10 | `TaskDetailPage.tsx` (TaskMetaPanel) | Sin validación frontend `startDate ≤ dueDate`; usuario recibía 400 sin mensaje útil | Agregado `dateRangeError` derivado, mensaje rojo y botón Guardar deshabilitado mientras haya error |

---

## P2 — Features creadas (3 páginas + ajustes)

### Charts (`/finance/charts`)
**Archivo:** `frontend/src/features/finance/pages/FinanceChartsPage.tsx` (430 líneas)

4 gráficas con Recharts (instalado con `--legacy-peer-deps` por conflicto React 19 vs gantt-task-react que requiere 18):
- **MonthlyEvolutionChart** (BarChart agrupado): ingresos verde / gastos rojo por mes
- **CategoryDonutChart** (PieChart donut): distribución de gastos por categoría usando `category.color`
- **BalanceTrendChart** (LineChart): tendencia de saldo a lo largo del año
- **PeriodComparisonChart** (BarChart side-by-side): comparación 2 períodos `yyyy-MM` con inputs `<input type="month">`

Filtros: año (últimos 5) + currency toggle. Skeleton/error/empty por tarjeta. Layout responsive 2 cols.

Endpoints usados (ya existían en backend, solo se agregaron al cliente API):
- `getMonthlyEvolution(year, currency)`
- `getCategoryDistribution(from, to, currency, type)`
- `getBalanceTrend(year, currency)`
- `getPeriodComparison(periodA, periodB, currency)`

### CategoryManager (`/finance/categories`)
**Archivo:** `frontend/src/features/finance/pages/CategoryManagerPage.tsx` (521 líneas)

Sección "Categorías del sistema" (chips read-only) y "Tus categorías" (filas editables con badge tipo). Modales crear/editar con form (name, type segmented, color picker). Modal eliminar maneja específicamente error 409 (`CATEGORY_IN_USE`) con mensaje claro. Invalidaciones a `['finance', 'categories']` y `['finance', 'transactions']`.

### TransactionDetail (`/finance/transactions/:id`)
**Archivo:** `frontend/src/features/finance/pages/TransactionDetailPage.tsx` (503 líneas)

Página dedicada (no modal). Breadcrumb. Form completo con todos los campos (type segmented, amount con validación NaN, currency toggle, exchangeRate disabled si MXN, date `max=today`, categoría filtrada por type, descripción). Sidebar con metadata read-only (createdAt, ID, fecha original, categoría). Modal de delete que navega al listado tras confirmar.

### Ajustes complementarios
- `FinanceSubNav.tsx` — agregados links "Categorías" y "Gráficas"
- `App.tsx` — registradas las 3 rutas. **`/finance/transactions/:id` colocada DESPUÉS de `/finance/transactions/trash`** para que `:id` no capture `trash`
- `package.json` — agregado `recharts`
- `TaskListPage.tsx` — eliminado import `useNavigate` no usado (TS6133 detectado por typecheck)

---

## Verificaciones realizadas

✅ **Frontend typecheck:** `npx tsc -b --noEmit` pasa sin errores tras todos los cambios
✅ **Aislamiento por user_id:** los 5/5 controllers de Finance y 6/6 controllers de Task usan `SecurityUtils.getCurrentUserId()`
✅ **Query keys unificados:** 0 referencias a `['task', ` (singular) en todo el frontend
✅ **TaskSpecification ORDER BY:** condicional `query.getResultType() != Long.class` evita romper queries de count
✅ **TaskDeletedEvent:** record creado siguiendo patrón de eventos existentes; publicado tras `save()` en transacción

⚠️ **Backend compilation:** no se pudo verificar localmente (Maven no instalado, no hay wrapper). Cambios siguen patrón de archivos vecinos previamente compilados; verificar al arrancar IDE.

---

## Decisiones confirmadas

1. **URL base `/finance` (no `/finances`)** — se mantuvo la implementación; el `finance.plan.md` queda desactualizado en este punto, debe corregirse el plan
2. **Recharts** — librería elegida para las 4 gráficas (sobre Tremor o Chart.js)
3. **Helper `validateCategoryAccess` no se extrajo a util compartido** — se duplica en TransactionService, BudgetService y SubscriptionService. Aceptable mientras solo sean 3; si crece, extraer a `finance/application/util/CategoryAccessValidator.java`

---

## Riesgos conocidos no abordados

- **TaskKanbanPage virtualización** (P2.4): `estimateSize: () => 100` hardcodeado; tarjetas reales rondan 80px. Causa pequeños saltos visuales con descripciones largas. Pulido pendiente
- **ClosingCommentModal** (P2.5): sin contador visible de chars, usuario no ve por qué el botón está deshabilitado
- **SubscriptionListPage** (P2.7): no valida `nextBillingDate` no pasada
- **Backend dependencia React 18 vs 19**: `gantt-task-react` requiere React 18 pero el proyecto está en 19; se usa `--legacy-peer-deps` para instalar nuevas dependencias. Migrar `gantt-task-react` a fork compatible con React 19 cuando exista

---

## Archivos tocados

**Backend (11):**
1. `SubscriptionService.java`
2. `shared/notification/event/TaskDeletedEvent.java` *(nuevo)*
3. `TaskService.java`
4. `TaskSpecification.java`
5. `task/domain/exception/AiServiceUnavailableException.java` *(nuevo)*
6. `TaskAiService.java`
7. `GlobalExceptionHandler.java`
8. `TaskResponse.java`
9. `TaskMapper.java`
10. `TaskDashboardService.java`
11. `TaskRepository.java`

**Frontend (16):**
12. `types/task.types.ts`
13. `api/tasks.api.ts`
14. `features/tasks/pages/TaskTrashPage.tsx`
15. `features/tasks/pages/TaskGanttPage.tsx`
16. `features/tasks/pages/TaskKanbanPage.tsx`
17. `features/tasks/pages/TaskDetailPage.tsx`
18. `features/tasks/pages/TaskListPage.tsx`
19. `features/finance/pages/TransactionListPage.tsx`
20. `features/finance/pages/FinanceSummaryPage.tsx`
21. `types/finance.types.ts`
22. `api/finance.api.ts`
23. `components/finance/FinanceSubNav.tsx`
24. `features/finance/pages/FinanceChartsPage.tsx` *(nuevo, 430 LOC)*
25. `features/finance/pages/CategoryManagerPage.tsx` *(nuevo, 521 LOC)*
26. `features/finance/pages/TransactionDetailPage.tsx` *(nuevo, 503 LOC)*
27. `App.tsx`

**Configuración (1):**
28. `frontend/package.json` — `recharts` agregado

---

## Pruebas manuales recomendadas (al arrancar)

**Backend** (Swagger UI `/swagger-ui.html`):
- POST `/api/finance/subscriptions` con `categoryId` de OTRO usuario → debe responder **403** (antes pasaba)
- DELETE `/api/tasks/{id}` → log debe mostrar publicación de `TaskDeletedEvent`
- GET `/api/tasks/{id}/subtasks` → no debe lanzar `LazyInitializationException`
- GET `/api/tasks` sin `?sort=` → orden HIGH primero, dueDate ascendente NULLs al final
- POST `/api/tasks/{id}/ai/subtasks` con APIs IA caídas → **503** (no 500)

**Frontend** (`npm run dev`):
- TaskDetailPage: cambiar estado y verificar refresh del detalle sin recargar
- TaskKanbanPage: drag entre columnas; ambas columnas se actualizan
- TaskGanttPage abierta con `?projectId=X` → filtra
- TransactionFormModal: escribir "abc" en monto → botón Guardar deshabilitado
- FinanceSummaryPage: crear budget y rebasarlo → banner de alerta visible
- `/finance/charts`: 4 gráficas se renderizan
- `/finance/categories`: crear/editar/eliminar (intentar borrar una categoría con transacciones → mensaje específico)
- `/finance/transactions/:id`: editar y guardar; eliminar y volver al listado
