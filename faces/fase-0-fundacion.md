# Fase 0 - Fundacion del monorepo

## Que se hizo

- Se creo la raiz del workspace con `package.json` y `turbo.json`.
- Se agrego `shared/` como base para logica comun.
- Se movio la autenticacion inicial a `shared/src/` con wrappers conservadores en el frontend.
- Se documento el avance para no perder trazabilidad entre fases.

## Como se abordo

- Se tomo como ancla el flujo de auth ya existente en el frontend.
- Se extrajo primero lo que tenia menos acoplamiento visual: tipos, cliente HTTP y store de auth.
- Se mantuvo el frontend operativo con wrappers delgados para evitar una migracion masiva en una sola pasada.
