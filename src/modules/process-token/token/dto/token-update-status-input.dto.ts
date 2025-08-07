import { IsOptional, IsString } from 'class-validator';

export class tokenStatusUpdateDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  transfer_counter_id?: string;

  @IsOptional()
  @IsString()
  transfered_token_id?: string;

  @IsOptional()
  @IsString()
  transfer_department_id?: string;

  @IsOptional()
  @IsString()
  filter_series_id?: string

  @IsOptional()
  @IsString()
  reason?: string;
}