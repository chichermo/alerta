import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { IncidentEntity } from "./incident.entity";
import { CreateIncidentDto, IncidentsQueryDto } from "./incidents.dto";

const KM_IN_DEGREE = 0.009;

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(IncidentEntity)
    private readonly incidentsRepo: Repository<IncidentEntity>
  ) {}

  async findAll(query: IncidentsQueryDto) {
    const qb = this.incidentsRepo.createQueryBuilder("incident");

    if (query.type) {
      qb.andWhere("incident.type = :type", { type: query.type });
    }

    if (query.confidence) {
      qb.andWhere("incident.confidence = :confidence", {
        confidence: query.confidence,
      });
    }

    if (
      query.minLat !== undefined &&
      query.maxLat !== undefined &&
      query.minLng !== undefined &&
      query.maxLng !== undefined
    ) {
      qb.andWhere("incident.lat BETWEEN :minLat AND :maxLat", {
        minLat: query.minLat,
        maxLat: query.maxLat,
      }).andWhere("incident.lng BETWEEN :minLng AND :maxLng", {
        minLng: query.minLng,
        maxLng: query.maxLng,
      });
    }

    qb.orderBy("incident.updatedAt", "DESC");
    return qb.getMany();
  }

  async createIncident(payload: CreateIncidentDto) {
    const incident = this.incidentsRepo.create({
      ...payload,
      reportsCount: 1,
      lastReportedAt: new Date(),
    });
    return this.incidentsRepo.save(incident);
  }

  async upsertFromReport(report: {
    title: string;
    type: string;
    lat: number;
    lng: number;
    source: string;
  }) {
    const radius = KM_IN_DEGREE * 1;
    const recentWindow = new Date(Date.now() - 3 * 60 * 60 * 1000);

    const existing = await this.incidentsRepo.findOne({
      where: {
        type: report.type,
        lat: Between(report.lat - radius, report.lat + radius),
        lng: Between(report.lng - radius, report.lng + radius),
      },
      order: { updatedAt: "DESC" },
    });

    if (!existing) {
      const confidence = report.source === "oficial" ? "confirmado" : "observacion";
      return this.createIncident({
        title: report.title,
        type: report.type,
        confidence,
        lat: report.lat,
        lng: report.lng,
        source: report.source,
      });
    }

    if (existing.lastReportedAt && existing.lastReportedAt < recentWindow) {
      existing.reportsCount = 1;
    } else {
      existing.reportsCount += 1;
    }

    existing.lastReportedAt = new Date();

    if (report.source === "oficial") {
      existing.confidence = "confirmado";
    } else if (existing.reportsCount >= 3) {
      existing.confidence = "alta_probabilidad";
    } else {
      existing.confidence = "observacion";
    }

    return this.incidentsRepo.save(existing);
  }
}
