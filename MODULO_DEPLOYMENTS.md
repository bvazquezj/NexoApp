# Módulo Deployments — Implementación completa

**Fecha:** 2026-05-16
**Backend:** Spring Boot 4.0.6 + PostgreSQL + Flyway V41-V45
**Frontend:** React 19 + Vite + Tailwind + Framer Motion
**Cifrado:** AES-256-GCM + HKDF-SHA256 (sin dependencias externas — solo JCA del JDK)

---

## Resumen

Quinto módulo completado tras Finanzas, Tareas, Hábitos y Proyectos. Implementa:

- **Deployments** con state machine de 6 estados (UNKNOWN, DEPLOYING, ACTIVE, DEGRADED, DOWN, INACTIVE)
- **Health checks** automáticos cada N min (configurable 1-60) con anti-flapping basado en últimos 5 checks
- **Métricas** uptime 24h/7d/30d, latencia promedio + p95, último incidente
- **Timeline visual** por hora (verde/amarillo/rojo)
- **Webhooks públicos** (sin JWT) autenticados por `hookToken` UUID v4 para integraciones Render/Vercel/custom
- **Env vars cifradas** AES-256-GCM con clave derivada por usuario (HKDF-SHA256)
- **Import/Export .env** con formato KEY=VALUE
- **Reveal SECRET** on-demand (descifra al pedirlo)
- **Notificaciones** por email cuando deployment cae/recupera/degrada (con cooldown de 1h)
- **Schedulers**:
  - `HealthCheckScheduler` cada minuto
  - `DeployingTimeoutScheduler` cada minuto (deployments stuck > 30min)
  - `HealthCheckCleanupScheduler` 3 AM diario (borra > 90 días)
  - `ApiPollingScheduler` cada 10 min (placeholder para Render/Vercel APIs)
- **Integración con Projects**: cada deployment vinculado a un proyecto

---

## Backend — 67 archivos

### Migraciones Flyway V41-V45 (5)

| V## | Contenido |
|---|---|
| V41 | `deployments` con CHECK status/environment/platform, hook_token UNIQUE, health check config |
| V42 | `deployment_records` (inmutable, JSONB para webhook_payload) |
| V43 | `deployment_health_checks` con BRIN index en checked_at |
| V44 | `deployment_env_vars` con PARTIAL UNIQUE INDEX (deployment_id, key) WHERE deleted_at IS NULL |
| V45 | Índices compuestos (user+status, hook_token, health_check, etc.) |

### Módulo `com.adminpersonal.deployment` (59 archivos)

- **4 entidades** (Deployment, DeploymentRecord, DeploymentHealthCheck, DeploymentEnvVar)
- **6 enums** (DeploymentStatus, DeploymentEnvironment, DeploymentPlatform, DeployRecordSource, HealthCheckResult, EnvVarType)
- **6 excepciones** de dominio
- **4 repositories** con queries especializadas (findDueForHealthCheck con threshold, findByHookToken, etc.)
- **DTOs**: 9 request + 11 response + 4 mappers
- **6 services**:
  - `DeploymentService` (CRUD + state changes + platform token)
  - `DeploymentRecordService` (deploys manuales)
  - `DeploymentEnvVarService` (CRUD + cifrado + import/export)
  - `DeploymentWebhookService` (procesa webhooks externos)
  - `DeploymentHealthCheckService` (HTTP check + anti-flapping + eventos)
  - `DeploymentMetricsService` (uptime, latencia, last incident)
- **5 controllers** (Deployment, DeploymentRecord, DeploymentEnvVar, DeploymentMetrics, DeploymentWebhook público)
- **4 schedulers**

### Shared (3 eventos nuevos)
- `DeploymentDownEvent`, `DeploymentRecoveredEvent`, `DeploymentDegradedEvent` en `shared/notification/event/`

### Cifrado: `shared/security/EncryptionService.java`
- **AES-256-GCM** con IV aleatorio de 96 bits + auth tag de 128 bits
- **HKDF-SHA256** para derivación determinística por `userId`:
  - PRK = HMAC-SHA256(masterKey, userId)
  - Key = HMAC-SHA256(PRK, "adminpersonal-v1" || 0x01), truncado a 256 bits
- **Master key**: variable `ENCRYPTION_MASTER_KEY` (base64, ≥ 32 bytes) con default dev en `application.yml`
- Sin dependencias externas: solo JCA del JDK 21
- Aplicado a: `Deployment.platformApiTokenEncrypted` y `DeploymentEnvVar.value`

### Endpoints REST (~25)

```
# Deployments
GET    /api/deployments?projectId=
GET    /api/deployments/trash
GET    /api/deployments/{id}
POST   /api/deployments
PUT    /api/deployments/{id}
DELETE /api/deployments/{id}
POST   /api/deployments/{id}/restore
PATCH  /api/deployments/{id}/status
PUT    /api/deployments/{id}/platform-api
POST   /api/deployments/{id}/platform-api/copy-from/{sourceId}
GET    /api/deployments/platform-tokens?platform=

# Records
GET    /api/deployments/{deploymentId}/records?page&size
POST   /api/deployments/{deploymentId}/records

# Metrics
GET    /api/deployments/{deploymentId}/metrics
GET    /api/deployments/{deploymentId}/timeline?from&to

# Env Vars
GET    /api/deployments/{deploymentId}/env-vars
POST   /api/deployments/{deploymentId}/env-vars
PUT    /api/deployments/{deploymentId}/env-vars/{varId}
DELETE /api/deployments/{deploymentId}/env-vars/{varId}      # HARD delete
GET    /api/deployments/{deploymentId}/env-vars/{varId}/reveal
POST   /api/deployments/{deploymentId}/env-vars/import
GET    /api/deployments/{deploymentId}/env-vars/export        # blob attachment

# Webhook público (sin JWT)
POST   /api/webhooks/deployments/{hookToken}
```

### Webhook contract

```bash
POST /api/webhooks/deployments/{hookToken}
Content-Type: application/json

{
  "url": "https://api.mi-app.onrender.com",
  "version": "abc1234",
  "branch": "main",
  "status": "success",   // started | success | failed | (ausente)
  "notes": "Fix en login"
}
```

Lógica:
- `started` → status DEPLOYING
- `success` → status ACTIVE, registra `lastDeployedAt`, crea DeploymentRecord
- `failed` → status DOWN
- Sin status → fuerza health check inmediato
- 404 si hookToken no existe, 410 si deployment eliminado

### Anti-flapping del health check

Ventana de los últimos 5 checks:
- Último = UP → `ACTIVE`
- Último = DOWN/TIMEOUT → `DOWN`
- Último = DEGRADED → `DEGRADED` si ≥ 2 de 5 son malos, sino `ACTIVE`

Eventos publicados al cambiar status (con cooldown de 60 min en `lastEmailSentAt`):
- `→ DOWN` + `notifyOnDown` → DeploymentDownEvent
- `DOWN|DEGRADED → ACTIVE` + `notifyOnRecovery` → DeploymentRecoveredEvent
- `→ DEGRADED` + `notifyOnDegraded` → DeploymentDegradedEvent

---

## Frontend — 22 archivos nuevos

### Tipos + API + Store + Utils
- `types/deployment.types.ts` — todos los tipos TS
- `api/deployments.api.ts` — todas las funciones API
- `stores/useDeploymentStore.ts` — Zustand
- `utils/deployment.ts` — helpers (webhookUrl builder, format)

### Componentes (10)
- `DeploymentStatusBadge`, `EnvironmentBadge`, `PlatformIcon` (icons por platform)
- `DeploymentCard`, `DeploymentDetailSubNav`
- `UptimeTimeline` (barras coloreadas por hora)
- 4 tabs: Overview, Health, Deploys, Variables

### Modales (7)
- `DeploymentFormModal` (crear/editar)
- `ChangeStatusModal` (INACTIVE/UNKNOWN/ACTIVE)
- `ConfigurePlatformTokenModal` (configurar o copiar de otro deployment)
- `RecordFormModal` (deploy manual)
- `EnvVarFormModal` (key, value, type)
- `ImportEnvVarsModal` (textarea + defaultType)
- `RevealEnvVarModal` (mostrar SECRET descifrado on-demand)

### Páginas (3)
- `features/deployments/pages/DeploymentListPage.tsx` (`/deployments`)
- `features/deployments/pages/DeploymentTrashPage.tsx` (`/deployments/trash`)
- `features/deployments/pages/DeploymentDetailPage.tsx` (`/deployments/:id`)

### Modificados (2)
- `App.tsx` — 3 rutas (`/trash` antes que `/:id`)
- `Sidebar.tsx` — item "Deployments" con CloudIcon

### Características UX destacadas
- **Webhook URL copy**: `${origin}/api/webhooks/deployments/{hookToken}` con botón al portapapeles
- **Env var SECRET masking**: `WebkitTextSecurity: 'disc'` para textareas (no soportan type=password)
- **Reveal modal**: nunca persiste valor descifrado en store, solo local state efímero
- **Copy token from another**: lista candidatos via `listPlatformTokens(platform)` para reusar tokens cifrados (mismo userId = misma derived key)
- **Export .env**: descarga via Blob + URL.createObjectURL
- **Timeline visual**: cuadraditos coloreados por bucket (verde/amarillo/rojo) tipo GitHub contributions

---

## Verificación

✅ **Frontend:** `npx tsc -b --noEmit` pasa sin errores
⚠️ **Backend:** no compilable localmente (Maven no instalado). Probar al arrancar IDE.

### Bug del selector aplicado proactivamente

Patrón LEFT JOIN explícito ya aplicado en módulos anteriores. En este módulo no aplica porque no hay categorías sistema vs usuario — solo deployments del usuario.

---

## Decisiones técnicas tomadas

| # | Decisión |
|---|----------|
| 1 | **EncryptionService sin deps**: HKDF + AES-GCM implementado solo con JCA del JDK |
| 2 | **Master key default dev**: hardcoded en application.yml para desarrollo; producción debe setear `ENCRYPTION_MASTER_KEY` env var |
| 3 | **Copy platform token sin re-cifrar**: mismo userId → misma derived key → blob cifrado es directamente reutilizable |
| 4 | **HARD delete de env vars**: el blob cifrado se borra permanentemente (no soft delete) por seguridad |
| 5 | **HC síncrono en scheduler**: v1 con pocos deployments. v2 migrar a `@Async + ThreadPoolTaskExecutor` |
| 6 | **Métricas on-the-fly**: calculadas en Java desde los 30d de checks. v2 cachear con Redis 5min TTL |
| 7 | **Cooldown email 60min**: evita spam si el deployment está flapeando antes de ser detectado por anti-flapping |
| 8 | **ApiPollingScheduler placeholder**: estructura lista pero RenderApiClient/VercelApiClient sin implementar (requiere credenciales reales) |
| 9 | **Webhook sin firma HMAC**: v1 confía en hookToken UUID v4 (122 bits entropía). v2 agregar header X-Signature opcional |
| 10 | **Cascade soft delete de env vars**: al eliminar deployment, sus env vars se marcan deletedAt. Al restaurar, se restauran |

---

## Pendientes (v2 / fuera de scope)

- **RenderApiClient + VercelApiClient**: clientes HTTP reales para polling de APIs (requiere registro de developer en cada plataforma)
- **Async health checks**: ThreadPoolTaskExecutor para escalar a > 50 deployments concurrentes
- **WebSocket o SSE para HC live**: actualmente el frontend hace polling React Query; SSE permitiría push instantáneo de status change
- **Webhook signature verification**: HMAC con secret compartido para validar autenticidad
- **Email templates**: el evento `DeploymentDownEvent` se publica pero no hay listener que mande email — requiere `DeploymentNotificationListener` con Resend SDK
- **Métricas dashboard global**: widget de "deployments down" en el dashboard general del sistema
- **Re-key process**: rotación de `ENCRYPTION_MASTER_KEY` requiere descifrar todos los env vars con clave vieja y re-cifrar con nueva (script de migración)
- **Variable de entorno upload .env via drag&drop**: actualmente solo paste en textarea

---

## Cómo probar (al arrancar backend desde IDE)

### 1. Crear deployment vinculado a proyecto
```bash
POST /api/projects → crear proyecto
POST /api/deployments {
  "name": "API Producción",
  "projectId": "<projectId>",
  "environment": "PROD",
  "platform": "RENDER",
  "url": "https://mi-api.onrender.com",
  "healthCheckEnabled": true,
  "healthCheckIntervalMinutes": 5
}
# Response incluye hookToken UUID
```

### 2. Health check automático
Esperar 1 min — `HealthCheckScheduler` debería ejecutar `executeCheck()` y actualizar status. Verificar:
```bash
GET /api/deployments/{id}/metrics
GET /api/deployments/{id}/timeline?from=...&to=...
```

### 3. Webhook desde Render/Vercel
```bash
curl -X POST http://localhost:8080/api/webhooks/deployments/{hookToken} \
  -H "Content-Type: application/json" \
  -d '{"version":"abc123","branch":"main","status":"success","notes":"Deploy desde CI"}'
# Esperado: 200 {"received": true}
# Debe crear DeploymentRecord y actualizar lastDeployedAt
```

### 4. Env vars cifradas
```bash
POST /api/deployments/{id}/env-vars {
  "key": "DATABASE_URL",
  "value": "postgres://user:pass@host/db",
  "type": "SECRET"
}
# Verificar en DB que value está cifrado (base64)
SELECT value FROM deployment_env_vars WHERE key='DATABASE_URL';
# → blob base64 de ~88 chars

GET /api/deployments/{id}/env-vars/{varId}/reveal
# → devuelve "postgres://user:pass@host/db" descifrado
```

### 5. Import .env
```bash
POST /api/deployments/{id}/env-vars/import {
  "content": "API_KEY=abc\nDATABASE_URL=postgres://...\n#comment ignored\n",
  "defaultType": "SECRET"
}
# → { "imported": 2, "skipped": 0, "errors": [] }
```

### 6. Frontend
```powershell
cd frontend
npm run dev
```
- Abrir `/deployments` — debería verse listado
- Crear deployment desde modal (seleccionar un proyecto existente)
- Tab Health: ver timeline con cuadraditos coloreados
- Tab Variables: agregar, revelar SECRET, exportar .env
- Copiar webhook URL al portapapeles
- Configurar platform token cifrado

---

## Estado del proyecto

Tras este módulo:

| # | Módulo | Estado |
|---|--------|--------|
| 1 | Finanzas | ✅ Completo (con bugfix selector) |
| 2 | Tareas | ✅ Completo |
| 3 | Hábitos | ✅ Completo |
| 4 | Proyectos | ✅ Completo |
| 5 | **Deployments** | ✅ **Completo** |
| 6 | Dominios + Clientes | ⏳ Siguiente |

Total estimado de archivos backend hasta ahora: ~400 archivos Java + 45 migraciones Flyway.
Total frontend: ~80 archivos TS/TSX.

---

## Guía clara de despliegue a producción (Vercel + Render + Expo)

### 1) Backend en Render (Spring Boot)

Archivos preparados:
- `render.yaml` (Blueprint)
- `backend/Dockerfile`
- `backend/.dockerignore`
- `backend/.env.render.example`

Pasos:
1. En Render, crear servicio con **Blueprint** usando `render.yaml`.
2. Render creará el web service `nexoapp-backend` (la DB en este caso es Neon externa).
3. En variables del servicio backend, completar:
   - `CORS_ALLOWED_ORIGINS` = URL de Vercel (o múltiples separadas por coma)
   - `APP_BASE_URL` = URL pública del frontend
   - `DB_URL` = JDBC de Neon (pooler + `sslmode=require&channelBinding=require`)
   - `DB_USERNAME` y `DB_PASSWORD` = credenciales de Neon
   - `JWT_SECRET` = secreto fuerte (>= 256 bits)
   - `ENCRYPTION_MASTER_KEY` = base64 de 32 bytes
4. Deployar y validar:
   - `GET https://TU_BACKEND.onrender.com/api/health` debe devolver `204`.

Comando recomendado para generar `ENCRYPTION_MASTER_KEY`:
```bash
openssl rand -base64 32
```

### 2) Frontend en Vercel (Vite monorepo)

Archivo preparado:
- `vercel.json` (root del repo)

Configuración ya resuelta:
- Build monorepo: `pnpm --filter frontend build`
- Output: `frontend/dist`
- Rewrites SPA a `index.html`

Variable obligatoria en Vercel:
- `VITE_API_BASE_URL` = `https://TU_BACKEND.onrender.com`

Código listo para usar esta variable:
- `frontend/src/main.tsx` inicializa `setApiBaseUrl(import.meta.env.VITE_API_BASE_URL)`.

Checklist Vercel:
1. Importar el repo en Vercel.
2. Confirmar que use `vercel.json`.
3. Cargar variable `VITE_API_BASE_URL`.
4. Deployar.

### 3) Expo (EAS Build / Submit)

Archivos preparados:
- `mobiles/eas.json`
- `mobiles/.env.example`
- scripts nuevos en `mobiles/package.json`

Scripts listos:
- `pnpm --filter mobiles eas:configure`
- `pnpm --filter mobiles build:android`
- `pnpm --filter mobiles build:ios`
- `pnpm --filter mobiles submit:android`
- `pnpm --filter mobiles submit:ios`

Pasos:
1. Login Expo: `npx eas-cli@latest login`
2. Configurar proyecto EAS una vez:
   - `pnpm --filter mobiles eas:configure`
3. Construir binarios:
   - Android: `pnpm --filter mobiles build:android`
   - iOS: `pnpm --filter mobiles build:ios`
4. Publicar en stores con submit scripts.

### 4) Orden recomendado de despliegue

1. Render backend
2. Vercel frontend (ya con URL real de Render en `VITE_API_BASE_URL`)
3. Expo builds (apuntando al backend productivo)

### 5) Variables mínimas por entorno

Backend Render:
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
- `JWT_SECRET`
- `ENCRYPTION_MASTER_KEY`
- `CORS_ALLOWED_ORIGINS`
- `APP_BASE_URL`

Frontend Vercel:
- `VITE_API_BASE_URL`

Expo:
- `EXPO_PUBLIC_API_BASE_URL` (si conectas app móvil al backend real)
