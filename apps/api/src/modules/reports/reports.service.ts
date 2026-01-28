import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IncidentsService } from "../incidents/incidents.service";
import { PredictionService } from "../prediction/prediction.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";
import { CreateReportDto } from "./reports.dto";
import { ReportEntity } from "./report.entity";
import { mapIncident } from "../incidents/incident.mapper";

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportEntity)
    private readonly reportsRepo: Repository<ReportEntity>,
    private readonly incidentsService: IncidentsService,
    private readonly predictionService: PredictionService,
    private readonly realtimeGateway: RealtimeGateway
  ) {}

  async createReport(payload: CreateReportDto) {
    const report = this.reportsRepo.create({
      title: payload.title,
      type: payload.type,
      description: payload.description,
      lat: payload.location.lat,
      lng: payload.location.lng,
      evidenceUrl: payload.evidenceUrl,
      source: payload.source || "ciudadano",
    });

    const saved = await this.reportsRepo.save(report);
    const incident = await this.incidentsService.upsertFromReport({
      title: payload.title,
      type: payload.type,
      lat: payload.location.lat,
      lng: payload.location.lng,
      source: payload.source || "ciudadano",
    });

    const prediction = await this.predictionService.predict({
      type: incident.type,
      lat: incident.lat,
      lng: incident.lng,
    });

    const mappedIncident = mapIncident(incident);
    this.realtimeGateway.broadcastIncidentUpdate(mappedIncident);

    return {
      report: saved,
      incident: mappedIncident,
      prediction,
    };
  }
}
