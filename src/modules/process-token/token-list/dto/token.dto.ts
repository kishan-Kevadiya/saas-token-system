import {
  IsNumber,
  IsString,
  IsObject,
  IsArray,
  IsDateString,
} from 'class-validator';

export class TokenDataDto {
  @IsNumber()
  series_id: number;

  @IsString()
  token_status: string;

  @IsNumber()
  priority: number;

  @IsDateString()
  token_generate_time: string;

  @IsDateString()
  token_date: string;
}

export class StatusCountsDto {
  @IsNumber()
  WAITING: number;

  @IsNumber()
  PENDING: number;

  @IsNumber()
  HOLD: number;

  @IsNumber()
  COMPLETED: number;

  @IsNumber()
  TRANSFER: number;

  @IsNumber()
  ACTIVE: number;
}

export class StatusGroupDto {
  @IsNumber()
  count: number;

  @IsArray()
  tokens: TokenDataDto[];
}

export class SeriesStatisticsDto {
  @IsNumber()
  series_id: number;

  @IsString()
  series_abbreviation: string;

  @IsObject()
  status_counts: StatusCountsDto;

  @IsNumber()
  total: number;
}

export class OverallTotalsDto {
  @IsObject()
  WAITING: StatusGroupDto;

  @IsObject()
  PENDING: StatusGroupDto;

  @IsObject()
  HOLD: StatusGroupDto;

  @IsObject()
  COMPLETED: StatusGroupDto;

  @IsObject()
  TRANSFER: StatusGroupDto;

  @IsObject()
  ACTIVE: StatusGroupDto;

  @IsNumber()
  total: number;
}

export class CompanyInfoDto {
  @IsNumber()
  company_id: number;
}

export class CounterInfoDto {
  @IsNumber()
  counter_id: number;
}

export class StatisticsMetaDto {
  @IsNumber()
  total_series: number;

  @IsDateString()
  generated_at: string;
}

export class TokenStatisticsResponseDto {
  @IsArray()
  series_data: SeriesStatisticsDto[];

  @IsObject()
  overall_totals: OverallTotalsDto;

  @IsObject()
  company_info: CompanyInfoDto;

  @IsObject()
  counter_info: CounterInfoDto;

  @IsString()
  filter_date: string;

  @IsObject()
  statistics_meta: StatisticsMetaDto;
}
