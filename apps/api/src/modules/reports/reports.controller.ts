import { Body, Controller, Post } from "@nestjs/common";
import { CreateReportDto } from "./reports.dto";
import { ReportsService } from "./reports.service";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async create(@Body() body: CreateReportDto) {
    return this.reportsService.createReport(body);
  }
}
