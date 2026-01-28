# Alerta Pública – Chile

Radar ciudadano inteligente de incidentes y servicios críticos. Esta base incluye:

- `apps/web`: portal web con mapa, filtros y reportes.
- `apps/api`: backend NestJS con eventos, alertas y WebSockets.
- `apps/ai`: servicio Python para predicción y clasificación básica.
- `packages/shared`: tipos compartidos.
- `docs`: dossier técnico, MVP, wireframes y pitch deck.

## Inicio rápido (local)

1. Instalar dependencias:
   - `npm install`
2. Levantar servicios (3 procesos):
   - `npm run dev`

## Requisitos locales

- Node.js 20+
- Python 3.11+
- Docker (para PostgreSQL/Redis, opcional en MVP)

## Estructura de servicios

- Web: `http://localhost:3000`
- API: `http://localhost:4000`
- AI: `http://localhost:8000`

## Documentación

Revisa `docs/` para arquitectura, MVP y entregables.
