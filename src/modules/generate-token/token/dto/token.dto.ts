import { IsOptional, IsString } from 'class-validator';

export class GenerateTokenCreateInputDto {
  @IsString()
  series_id: string;

  @IsString()
  company_id: string;

  @IsString()
  language_id: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsOptional()
  form_data?: string;

  @IsOptional()
  @IsString()
  mobile_number?: string;
}
