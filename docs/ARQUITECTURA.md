# Arquitectura técnica (propuesta ejecutada)

## Visión general

Arquitectura en 3 capas:

- Ingesta y validación (`apps/api`)
- Predicción y clasificación (`apps/ai`)
- Visualización y alertas (`apps/web`)

## Componentes

### Backend (`apps/api`)

- NestJS + REST + WebSockets
- PostgreSQL (MVP usa lat/lng; PostGIS planificado)
- Redis (canal de eventos y rate limit)
- Scheduler para ingesta de fuentes oficiales

### IA (`apps/ai`)

- FastAPI
- Clasificación heurística + clustering simple
- Endpoint `/predict` para riesgo y categoría

### Frontend (`apps/web`)

- Next.js (App Router)
- React Leaflet + OpenStreetMap
- Tailwind CSS

## Flujo de datos

1. Reporte ciudadano llega a API
2. Validación de reputación + cercanía temporal
3. Se crea/actualiza incidente
4. API emite evento por WebSocket
5. Web actualiza mapa y timeline
6. API consulta IA para predicción

## Escalamiento

- Separación por microservicios
- Cache per-region
- Colas para ingestión
