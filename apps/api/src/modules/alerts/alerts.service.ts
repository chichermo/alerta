import { Injectable } from "@nestjs/common";
import { IncidentsService } from "../incidents/incidents.service";
import { PredictionService } from "../prediction/prediction.service";
import { mapIncident } from "../incidents/incident.mapper";

@Injectable()
export class AlertsService {
  constructor(
    private readonly incidentsService: IncidentsService,
    private readonly predictionService: PredictionService
  ) {}

  async listAlerts() {
    const incidents = await this.incidentsService.findAll({
      confidence: "alta_probabilidad",
    });
    const enriched = await Promise.all(
      incidents.map(async (incident) => {
        const prediction = await this.predictionService.predict({
          type: incident.type,
          lat: incident.lat,
          lng: incident.lng,
        });
        return { incident: mapIncident(incident), prediction };
      })
    );
    return enriched;
  }
}
