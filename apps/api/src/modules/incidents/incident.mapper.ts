import { IncidentEntity } from "./incident.entity";

export function mapIncident(entity: IncidentEntity) {
  return {
    id: entity.id,
    title: entity.title,
    type: entity.type,
    confidence: entity.confidence,
    location: {
      lat: entity.lat,
      lng: entity.lng,
    },
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    reportsCount: entity.reportsCount,
    source: entity.source,
  };
}
