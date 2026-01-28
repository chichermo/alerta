import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { IncidentsModule } from "../incidents/incidents.module";
import { PredictionModule } from "../prediction/prediction.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { ReportsController } from "./reports.controller";
import { ReportEntity } from "./report.entity";
import { ReportsService } from "./reports.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportEntity]),
    IncidentsModule,
    PredictionModule,
    RealtimeModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
