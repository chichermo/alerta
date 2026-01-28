import { IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class IncidentsQueryDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  confidence?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minLat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxLat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minLng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxLng?: number;
}

export class CreateIncidentDto {
  @IsString()
  title!: string;

  @IsString()
  type!: string;

  @IsString()
  confidence!: string;

  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsOptional()
  @IsString()
  source?: string;
}
