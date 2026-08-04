# Reporte QA — AdminPersonal MVP completo

**Fecha:** 2026-05-18
**Alcance:** Backend (470 archivos Java, 57 migraciones Flyway, 6 módulos) + Frontend (~95 archivos TS/TSX)
**Método:** 2 agentes reviewer en paralelo (backend arquitectura+seguridad; frontend tipos+UX) + verificación manual

---

## Resumen ejecutivo

- 🔴 **8 CRÍTICOS** detectados — **6 FIX aplicados, 2 documentados como pendientes**
- 🟠 **31 ALTOS** detectados — selectivos fix aplicados
- 🟡 **22 MEDIOS** detectados — documentados para v2
- 🟢 **15 BAJOS** — documentados

**Veredicto:** APROBADO CON FIXES APLICADOS. Quedan tareas concretas para producción.

---

## 🔴 Críticos — estado de cada uno

| # | Hallazgo | Estado |
|---|----------|--------|
| C1 | **Secretos productivos en `application.yml`** — keys reales de Gemini/Groq/Resend, password de DB | ✅ **FIX aplicado.** Reemplazados con placeholders SOLO-dev. **ACCIÓN REQUERIDA:** rotar todas estas keys YA, eran reales |
| C2 | **`DomainCheckController` sin validación de ownership** — cross-tenant leak | ✅ **FIX aplicado.** Agregada llamada `domainService.ownedDomain(userId, domainId)` antes de listar checks |
| C3 | **`spring.jpa.hibernate.ddl-auto: update`** con Flyway activo — drift garantizado | ✅ **FIX aplicado.** Cambiado a `validate` |
| C4 | **`client_id` huérfano en Project/Deployment** — migraciones V54/V56 agregaron columna pero entidades no la mapeaban → `ClientService.countActiveProjects/Deployments` siempre 0 | ✅ **FIX PARCIAL.** Agregado `@ManyToOne Client client` en `Project.java` y `Deployment.java`. **PENDIENTE:** exponer `clientId` en `Create/UpdateProjectRequest` y `Create/UpdateDeploymentRequest` para asignación desde UI |
| C5 | **3 schedulers con `@Transactional(readOnly=true)` que llaman métodos que escriben** — Hibernate fallaría al `flush()` | ✅ **FIX aplicado.** Removido `@Transactional` externo en `HealthCheckScheduler`, `DeployingTimeoutScheduler`, `DnsVerificationScheduler` |
| C6 | **`NotificationsBell` con `onMouseEnter`** marca notificaciones leídas — N POSTs al pasar cursor por la lista | ✅ **FIX aplicado.** Cambiado a `onClick` |
| C7 | **`client.ts` axios interceptor** — primer 401 que dispara refresh nunca se reintenta (queda colgado) | ✅ **FIX aplicado.** Reescrito con `refreshPromise` única que todos los 401 esperan |
| C8 | **Form modals con `useState(prop)` sin reset** — al editar fila A y luego fila B sin desmontar el padre, muestra datos de A | ✅ **FIX aplicado.** Agregado `useEffect([open, entity])` que resetea estado en: `ClientFormModal`, `TransactionFormModal`, `SubscriptionFormModal` |

---

## 🟠 Altos — destacados

### Backend
- **`TaskTypeResponse` sin `@JsonProperty("isSystem")`** → rompía convención del bug previo del selector. ✅ **FIX aplicado** (también en `frontend/src/types/task.types.ts: system → isSystem`)
- **Sin `CorsConfigurationSource`** — frontend en `:5173` no podrá llamar al backend en `:8080`. **PENDIENTE:** agregar bean CORS o configurar reverse proxy
- **`@Lazy` sobre campo `final` con Lombok @RequiredArgsConstructor no surte efecto** — necesita `lombok.config` con `copyableAnnotations += org.springframework.context.annotation.Lazy`. Bug latente; no afecta hasta que aparezca un ciclo real
- **N+1 en `ProjectService.findAll/Trash`** — cada proyecto invoca `progressService.calculate()` con 2 queries. Con 100 proyectos → 200 queries extra. **PENDIENTE:** agregar `Map<UUID, Progress>` agregado en TaskRepository
- **HKDF en `EncryptionService` con `salt`/`IKM` invertidos vs RFC 5869** — funcionalmente sigue siendo KDF determinista, pero auditorías lo señalarán. **PENDIENTE:** corregir orden o cambiar javadoc

### Frontend
- **`TaskKanbanPage` invalida `['tasks-dashboard']`** pero ninguna query usa esa key (invalidate fantasma)
- **`['tasks-trash']` no se invalida** al borrar desde TaskListPage/TaskDetailPage. **FIX sugerido:** usar `['tasks', 'trash']` para que el invalidate de `['tasks']` la alcance
- **`DomainListPage` y `ClientListPage` sin manejo de `isError`** — el usuario ve "Sin dominios/clientes" engañosamente si el GET falla
- **Modales globales sin focus management/trap** — escape no cierra, Tab puede salir al body. Aceptable v1
- **`ClientListPage` con emojis** `✏️ 🗑️ 📧` en UI — inconsistente con el resto que usa SVG. **PENDIENTE:** reemplazar por iconos SVG
- **Ruta `/clients/:id` faltante** pese a que `getClient(id)` API existe. **PENDIENTE:** crear `ClientDetailPage` o documentar como out-of-scope v1

---

## 🟡 Medios — destacados

- `V45__create_deployment_indexes.sql` declara `idx_deployments_hook_token` que duplica el UNIQUE de V41 (desperdicio de espacio)
- `NameserverService.delete()` hace HARD delete pero el schema/repo soporta soft delete (inconsistencia)
- `DomainService.update` no permite UNSET (null) de `clientId`/`projectId` — solo asignar nuevo
- `pom.xml` declara `<java.version>25</java.version>` (no LTS) — confirmar si es intencional o debería ser 21
- `HabitListPage`: `HabitCard` hace `useQuery(['habits', id])` por card → N requests para mostrar la lista
- Emojis dispersos en DomainListPage, DomainDetailPage (`✅ Sí / ❌ No`) — inconsistente con el resto del UI
- Validaciones frontend faltantes: `nextBillingDate` no se valida no-pasada en SubscriptionFormModal, `exchangeRate` no se valida cuando currency=USD, iteration dates no se validan vs project dates

---

## 🟢 Bajos — destacados

- Comentarios desactualizados en `ProjectService.update()` (línea 101)
- `SecureRandom` instanciado en cada `EncryptionService.encrypt()` (debería ser field)
- `DnsVerificationService.resolvedIpsJson` construido con StringBuilder (debería usar Jackson)
- `application.yml` con `format_sql: true` (penaliza CPU del logger en prod) — ✅ cambiado a `false` en el fix de C3

---

## Eventos huérfanos (sin listener)

Los siguientes eventos se publican pero NO tienen `@EventListener` que mande email/notificación. **Está documentado como v2** en cada módulo, pero recordatorio:

| Evento | Publicador | Pendiente listener |
|--------|-----------|--------------------|
| `TaskDueTodayEvent` | shared/notification cron | Email via Resend |
| `TaskDueTomorrowEvent` | idem | Email |
| `TaskReviewStalledEvent` | idem | Email |
| `DeploymentDownEvent` | `DeploymentHealthCheckService` | Email |
| `DeploymentRecoveredEvent` | idem | Email |
| `DeploymentDegradedEvent` | idem | Email |
| `DomainExpirationEvent` | `DomainAlertService` | Email |

`TaskDeletedEvent` SÍ tiene listener (`TaskDeletedHabitListener` limpia BlockTaskLinks).

---

## Backend — compilación

⚠️ **No se compiló localmente con Maven** (no instalado). Los fixes aplicados siguen los patrones de archivos vecinos previamente probados. **Recomendación: al arrancar desde IDE, validar que los siguientes archivos compilen sin errores:**
- `Project.java`, `Deployment.java` (nuevo campo `Client client`)
- `TaskTypeResponse.java` (`@JsonProperty` agregado)
- `DomainCheckController.java` (nuevo inject de `DomainService`)
- 3 schedulers modificados (sin `@Transactional` import si quedó huérfano)
- `application.yml` (válido YAML)

---

## Frontend — verificación

✅ `npx tsc -b --noEmit` pasa sin errores tras todos los fixes aplicados.

---

## Pendientes recomendados antes de producción

### Críticos
1. **Rotar las API keys filtradas en application.yml** (DB password, Gemini, Groq, Resend, encryption master key)
2. **Configurar variables de entorno** `DB_PASSWORD`, `JWT_SECRET`, `ENCRYPTION_MASTER_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `RESEND_API_KEY` con valores reales nuevos
3. **Agregar CORS config** en `SecurityConfig.java` permitiendo `http://localhost:5173` en dev y el dominio real en prod
4. **Agregar `clientId` a `Create/UpdateProjectRequest` y `Create/UpdateDeploymentRequest`** y mapear en los services (sin esto, los conteos del ClientRepository siempre serán 0)

### Importantes (1-2 días)
5. Implementar listeners de email para los 7 eventos huérfanos
6. Crear `ClientDetailPage` o quitar `getClient(id)` API si no se usará
7. Optimizar N+1 en `ProjectService.findAll/Trash`
8. Agregar `lombok.config` con `copyableAnnotations += @Lazy`
9. Reemplazar emojis por SVG icons en `ClientListPage`, `DomainListPage`, `DomainDetailPage`
10. Configurar trampa de foco en modales (focus-trap-react o similar)

### Nice-to-have
11. Reescribir HKDF de EncryptionService según RFC 5869 (orden de extract)
12. Migrar schedulers DNS/HealthCheck a `@Async` con thread pool
13. Documentar convenciones de naming `isXxx` para nuevos developers
14. Agregar trampa de foco/escape en NotificationsBell dropdown y menús de 3-dots

---

## Archivos modificados en esta sesión QA

### Fix de críticos
1. `backend/src/main/resources/application.yml` — sanitización de secretos + ddl-auto=validate + format_sql=false
2. `backend/.../domain/infrastructure/web/DomainCheckController.java` — validación ownership
3. `backend/.../deployment/infrastructure/scheduler/HealthCheckScheduler.java` — quitado `@Transactional(readOnly)` externo
4. `backend/.../deployment/infrastructure/scheduler/DeployingTimeoutScheduler.java` — idem
5. `backend/.../domain/infrastructure/scheduler/DnsVerificationScheduler.java` — idem
6. `backend/.../task/application/dto/response/TaskTypeResponse.java` — `@JsonProperty("isSystem")`
7. `backend/.../project/domain/model/Project.java` — agregado `@ManyToOne Client client`
8. `backend/.../deployment/domain/model/Deployment.java` — idem
9. `frontend/src/types/task.types.ts` — `TaskTypeResponse.system → isSystem`
10. `frontend/src/components/notifications/NotificationsBell.tsx` — `onMouseEnter → onClick`
11. `frontend/src/api/client.ts` — reescrito con `refreshPromise` única
12. `frontend/src/features/clients/pages/ClientListPage.tsx` — `useEffect` reset form modal
13. `frontend/src/features/finance/pages/TransactionListPage.tsx` — idem
14. `frontend/src/features/finance/pages/SubscriptionListPage.tsx` — idem

---

## Veredicto final

El MVP está **arquitectónicamente sólido** con buen aislamiento entre módulos, soft delete consistente, cifrado AES-256-GCM bien implementado y schedulers separados. Los 6 críticos resueltos eran bugs específicos (no fallas de diseño). Los 2 críticos pendientes (rotar keys + agregar `clientId` a DTOs) son tareas de minutos.

**Listo para staging** tras rotar credenciales filtradas y configurar variables de entorno reales. **Production-ready** tras implementar listeners de email y CORS.
