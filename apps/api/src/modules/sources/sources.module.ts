import { Module } from "@nestjs/common";
import { IncidentsModule } from "../incidents/incidents.module";
import { SourcesService } from "./sources.service";

@Module({
  imports: [IncidentsModule],
  providers: [SourcesService],
})
export class SourcesModule {}
