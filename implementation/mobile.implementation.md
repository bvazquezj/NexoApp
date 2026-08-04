# Estado de implementación — App móvil

**Plan de referencia:** `plans/mobile.plan.md`  
**Última revisión:** 2026-07-28  
**Estado global:** Fundaciones F0, estructura de navegación F1 y núcleo offline F2 implementados y verificados mediante typecheck. Las pantallas funcionales de negocio empiezan en F4.

## Resumen por fase

| Fase | Estado | Resultado verificable |
|---|---|---|
| F0 — Monorepo y `shared/` | Completada | Contratos, APIs y utilidades compartibles viven en `shared/`; el frontend mantiene fachadas de compatibilidad. |
| F1 — Expo y navegación | Completada | Navegación de autenticación y de todos los módulos/rutas definida con placeholders; drawer adaptativo. |
| F2 — Red y offline | Completada | SQLite, caché, cola FIFO, sincronización, monitor de red/servidor, mutaciones optimistas y banner. |
| F3 — Autenticación UI | Parcial | Store, API y SecureStore nativo listos; faltan formularios y flujos visuales. |
| F4 — Pantallas de módulos | Pendiente | Las rutas existen, pero muestran placeholders hasta implementar cada pantalla. |
| F5 — Optimización tablet | Parcial | Drawer adaptativo y detección de tablet; faltan SplitView, ResponsiveGrid y layouts por módulo. |
| F6 — Estados de red avanzados | Parcial | Endpoint health, monitor y banner base listos; faltan animaciones, toast y pantalla de detalle de cola. |
| F7 — Notificaciones | Pendiente | Sin `expo-notifications`. |
| F8 — Build y CI/CD | Pendiente | Sin `eas.json`, workflow móvil ni APK verificado. |

## Trabajo completado en esta actualización

### 1. Tipado y entorno de `mobile`

- [x] Se añadió `@types/react` como dependencia de desarrollo de `mobile`.
- [x] Se instaló `expo-sqlite` `~16.0.10` y `expo-secure-store` `~15.0.8`, versiones recomendadas para Expo SDK 54.
- [x] Se eliminó la solución temporal de rutas a los tipos del frontend: `mobile` resuelve ahora sus propios tipos.
- [x] El `tsc --noEmit -p mobile/tsconfig.json` finaliza sin errores.

### 2. F0 — Monorepo y paquete compartido

- [x] Se trasladaron a `shared/src/types/` los contratos de tareas, finanzas, hábitos, proyectos, deployments, dominios y clientes.
- [x] Se trasladaron a `shared/src/api/` las APIs de tareas, finanzas, hábitos, proyectos, deployments y dominios/clientes.
- [x] Se trasladó `utils/finance.ts` a `shared/src/utils/finance.ts`; las utilidades de deployments que dependen de DOM/navegador se mantienen deliberadamente en el frontend para respetar la regla de código compartido agnóstico de plataforma.
- [x] Se ampliaron los exports públicos de `@adminpersonal/shared` y sus exports de subrutas de tipos.
- [x] Se añadió `@adminpersonal/shared` como dependencia del frontend y se configuraron alias de TypeScript/Vite para resolverlo durante desarrollo y build.
- [x] Los módulos antiguos bajo `frontend/src/api`, `frontend/src/types` y `frontend/src/utils/finance` se conservaron como fachadas que reexportan desde `shared`. Esto evita romper los imports existentes mientras el código fuente único reside en `shared`.
- [x] Se actualizó el cliente HTTP compartido para aceptar una URL base configurable en móvil y exponer errores HTTP tipados (`ApiRequestError`).
- [x] Validación de F0: `shared` y `frontend` pasan TypeScript sin errores.

### 3. F1 — Navegación y placeholders

- [x] `AuthStack` incluye Login, Register, VerifyEmail, VerifyEmailPending, ForgotPassword y ResetPassword.
- [x] Se crearon las pilas de navegación de Tasks, Finance, Habits, Projects, Deployments, Clients y Domains.
- [x] Cada pila contiene las rutas de lista, detalle, formulario, papelera y vistas especializadas definidas en el plan (Kanban, Gantt, categorías, gráficas, rutinas, sueño, etc.).
- [x] `MainTabs` enlaza Dashboard, Tasks, Finance, Habits y Projects; `MainDrawer` enlaza también Deployments, Clients, Domains y Notifications.
- [x] `MainDrawer` usa `useResponsive`: drawer permanente en tablet y drawer frontal en teléfono.
- [x] Todas las rutas creadas renderizan `PlaceholderScreen` con un título explícito hasta iniciar F4.

### 4. F2 — Offline-first y sincronización

- [x] Se creó `services/database.ts` con SQLite en modo WAL y tablas de caché para tasks, transactions, habits, projects, deployments, domains y clients.
- [x] Se creó `sync_queue` con acción, endpoint, método, payload, contador de reintentos, estado y mensaje de error; además de `cache_queries` y `sync_metadata`.
- [x] Se creó `services/cache.ts` para lectura/escritura/invalidez de entidades y consultas cacheadas, y para operar la cola.
- [x] Se creó `services/syncEngine.ts`: procesa como máximo cinco operaciones FIFO, intenta renovar tokens ante 401, cancela errores 4xx, reintenta fallos transitorios hasta tres veces y aplica backoff 1/2/4 segundos.
- [x] Se creó `services/networkMonitor.tsx` con `NetInfo`, comprobación de `HEAD /api/health` cada 30 segundos, `NetworkContext` y disparo de sincronización al recuperar servidor.
- [x] Se creó `useOfflineMutation`: aplica primero el cambio local, lo encola y sincroniza de inmediato cuando hay conectividad y servidor disponible.
- [x] Se creó `useSyncQueue` y `NetworkBanner`, que muestran offline, servidor no disponible, operaciones pendientes o sincronización y permiten reintentar.
- [x] Se registró `expo-secure-store` como plugin y se conectó `secureStorageAdapter` al store de autenticación para persistir de forma cifrada el refresh token en dispositivo.
- [x] Se añadió `GET`/`HEAD /api/health` sin autenticación en el backend y se permitió en `SecurityConfig`, para que el monitor pueda distinguir servidor caído de falta de internet.

## Validación realizada

Los siguientes comandos finalizaron correctamente el 2026-07-28:

```powershell
mobile\node_modules\.bin\tsc.cmd --noEmit -p mobile\tsconfig.json
shared\node_modules\.bin\tsc.cmd --noEmit -p shared\tsconfig.json
frontend\node_modules\.bin\tsc.cmd -b frontend\tsconfig.json
```

No se pudo ejecutar una compilación Maven del backend porque `mvn`/Maven Wrapper no están disponibles en el entorno actual. El endpoint se implementó siguiendo las anotaciones y la configuración de seguridad existentes; debe validarse con `mvn test` o `mvn package` en un entorno con Maven antes de desplegarlo.

## Próximos pasos recomendados

1. Implementar F3: formularios reales de autenticación y conexión con `authApi`/`useAuthStore`.
2. Iniciar F4 por dashboard y lista de tareas, usando `getCached*` como lectura inicial y fetch de servidor en segundo plano.
3. Completar F5 con `SplitView` y `ResponsiveGrid` al implementar las listas y detalles de F4.
4. Añadir toast, animaciones y vista de la cola en F6; después configurar EAS/CI en F8.

## Notas de seguimiento

- El monitor presupone que `EXPO_PUBLIC_API_URL` apunta al origen del backend, sin el sufijo `/api`; el cliente agrega ese prefijo de forma consistente.
- Las entradas de cola requieren rutas relativas como `/tasks` y métodos `POST`, `PUT`, `PATCH` o `DELETE`.
- La cola y la caché se validaron estáticamente. La validación funcional en un dispositivo/emulador debe hacerse antes de considerar F2 lista para producción.
