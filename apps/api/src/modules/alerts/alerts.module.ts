import { Module } from "@nestjs/common";
import { IncidentsModule } from "../incidents/incidents.module";
import { PredictionModule } from "../prediction/prediction.module";
import { AlertsController } from "./alerts.controller";
import { AlertsService } from "./alerts.service";

@Module({
  imports: [IncidentsModule, PredictionModule],
  controllers: [AlertsController],
  providers: [AlertsService],
})
export class AlertsModule {}
