# Fase 2 - Offline, cache y sincronizacion

## Estado

- Pendiente de implementacion.

## Enfoque previsto

- SQLite local para cache de lectura y cola de escritura.
- Sincronizacion FIFO con reintentos y backoff.
- Monitoreo de red con health check para distinguir internet caido de servidor no disponible.
