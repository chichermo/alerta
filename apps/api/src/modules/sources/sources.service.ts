import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { IncidentsService } from "../incidents/incidents.service";

@Injectable()
export class SourcesService {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Cron("0 */30 * * * *")
  async ingestMockSources() {
    const title = "Reporte oficial simulado";
    await this.incidentsService.upsertFromReport({
      title,
      type: "corte_luz",
      lat: -33.45,
      lng: -70.66,
      source: "oficial",
    });
  }
}
