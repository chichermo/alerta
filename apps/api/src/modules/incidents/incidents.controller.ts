import { Controller, Get, Query } from "@nestjs/common";
import { IncidentsService } from "./incidents.service";
import { IncidentsQueryDto } from "./incidents.dto";
import { mapIncident } from "./incident.mapper";

@Controller("incidents")
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  async list(@Query() query: IncidentsQueryDto) {
    const incidents = await this.incidentsService.findAll(query);
    return incidents.map(mapIncident);
  }
}
