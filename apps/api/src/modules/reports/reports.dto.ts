import { IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class LocationDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;
}

export class CreateReportDto {
  @IsString()
  title!: string;

  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ValidateNested()
  @Type(() => LocationDto)
  location!: LocationDto;

  @IsOptional()
  @IsString()
  evidenceUrl?: string;

  @IsOptional()
  @IsString()
  source?: string;
}
