import {
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GenerateTokenSeriesDto {
  @IsString()
  id: string;

  @IsString()
  series_name: string;

  @IsString()
  series_image: string | null;

  @IsNumber()
  display_form?: number;
}

export class FormFieldDto {
  @IsString()
  id: string;

  @IsString()
  field_name: string;

  @IsString()
  field_type: string;

  @IsNumber()
  is_required: number;
}

export class GenerateTokenSubSeriesResponseDto {
  @IsString()
  id: string;

  @IsBoolean()
  sub_series_present: boolean;

  @IsNumber()
  display_form: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  form_data: FormFieldDto[] | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GenerateTokenSeriesDto)
  series: GenerateTokenSeriesDto[] | null;
}
