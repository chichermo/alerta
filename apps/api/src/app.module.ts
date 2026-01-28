import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AlertsModule } from "./modules/alerts/alerts.module";
import { HealthModule } from "./modules/health/health.module";
import { IncidentsModule } from "./modules/incidents/incidents.module";
import { PredictionModule } from "./modules/prediction/prediction.module";
import { RealtimeModule } from "./modules/realtime/realtime.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { SourcesModule } from "./modules/sources/sources.module";
import { IncidentEntity } from "./modules/incidents/incident.entity";
import { ReportEntity } from "./modules/reports/report.entity";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(
      process.env.DB_TYPE === "postgres"
        ? {
            type: "postgres",
            host: process.env.DB_HOST || "localhost",
            port: Number(process.env.DB_PORT || 5432),
            username: process.env.DB_USER || "alerta",
            password: process.env.DB_PASS || "alerta",
            database: process.env.DB_NAME || "alerta",
            synchronize: true,
            entities: [IncidentEntity, ReportEntity],
          }
        : {
            type: "sqlite",
            database: process.env.DB_SQLITE_PATH || "alerta.sqlite",
            synchronize: true,
            entities: [IncidentEntity, ReportEntity],
          }
    ),
    IncidentsModule,
    ReportsModule,
    AlertsModule,
    PredictionModule,
    SourcesModule,
    RealtimeModule,
    HealthModule,
  ],
})
export class AppModule {}
