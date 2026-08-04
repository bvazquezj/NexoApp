# AdministracionPersonal — Project Overview

## Descripción

Hub centralizado de administración personal y profesional. Diseñado para gestionar el día a día: finanzas, tareas, hábitos, proyectos de desarrollo, deployments y dominios. Pensado como uso personal con arquitectura preparada para escalar a SaaS.

---

## Objetivos

- Centralizar en un solo lugar toda la gestión personal y profesional
- Tener visibilidad en tiempo real del estado de proyectos, apps desplegadas y dominios
- Construir iterativamente, empezando por un MVP funcional
- Diseño preparado para escalar a producto SaaS multi-usuario

---

## Módulos (por prioridad)

| Prioridad | Módulo | Descripción |
|-----------|--------|-------------|
| 1 | **Finanzas** | Registro de ingresos y gastos, presupuestos, balance mensual |
| 2 | **Tareas** | To-dos diarios, pendientes, categorización por contexto |
| 3 | **Hábitos** | Seguimiento de hábitos, racha diaria, historial |
| 4 | **Proyectos** | Estado, progreso, notas y links por proyecto de desarrollo |
| 5 | **Deployments** | Control de dónde y cómo están desplegadas las apps |
| 6 | **Dominios** | Registro de dominios, registrador, DNS, fecha de expiración |

---

## Stack Tecnológico

### Frontend
- **Framework:** React + Vite
- **Estilos:** Tailwind CSS
- **Animaciones:** Framer Motion + GSAP
- **Estado:** TBD (Zustand / React Query)

### Backend
- **Framework:** Spring Boot (Java)
- **API:** REST
- **Autenticación:** JWT + Spring Security

### Base de Datos
- **Motor:** PostgreSQL

### Mobile (fase futura)
- **Framework:** React Native
- Acceso a todos los módulos desde móvil

---

## UI / Diseño

- **Tema:** Dark mode y Light mode con toggle
- **Estilo:** Profesional tipo Notion con toque tech y minimalista
- **Layout:** Sidebar fija + área de contenido principal
- **Tipografía y espaciado:** limpio, respirable, sin ruido visual
- **Animaciones:** sutiles y funcionales (Framer Motion para transiciones, GSAP para efectos específicos)

---

## Autenticación

- Login con email y contraseña
- Preparado para OAuth (Google) en iteraciones futuras
- JWT para gestión de sesiones
- Diseñado para soportar múltiples usuarios (base para SaaS)

---

## Alcance y Estrategia

- **Fase 1 — MVP:** Módulos de Tareas y Hábitos funcionales con auth básica
- **Fase 2:** Finanzas y Proyectos
- **Fase 3:** Deployments y Dominios
- **Fase 4:** App móvil con React Native
- **Fase 5 (opcional):** Publicación como SaaS con planes y multi-tenancy

---

## Consideraciones Futuras (SaaS)

- Multi-tenancy (un usuario = sus propios datos aislados)
- Planes de suscripción (Free / Pro)
- Onboarding flow
- Notificaciones (dominios próximos a expirar, hábitos pendientes, etc.)

---

## Estado del Proyecto

> En definición — Sin fecha límite. Iteración continua.
