import { TokenStatus } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
import {
  IsString,
  IsEnum,
  IsDate,
  IsNumber,
  IsJSON,
} from 'class-validator';

export class TokenDto {
  @IsString()
  token_id: string;

  @IsString()
  token_abbreviation: string;

  @IsString()
  series_id: string;

  @IsNumber()
  token_number: number;

  @IsDate()
  token_date: Date;

  @IsNumber()
  priority: number;

  @IsString()
  counter_id: string | null;

  @IsString()
  user_id: string | null;

  @IsString()
  token_series_number: string;

  @IsDate()
  token_calling_time: Date | null;

  @IsDate()
  token_out_time: Date | null;

  @IsString()
  language_id: string;

  @IsString()
  company_id: string;

  @IsEnum(TokenStatus)
  token_status: TokenStatus;

  @IsString()
  transfer_counter_id: string | null;

  @IsString()
  transfer_department_id: string | null;

  @IsString()
  customer_mobile_number: string | null;

  @IsString()
  customer_name: string | null;

  @IsDate()
  token_generate_time: Date;

  @IsString()
  form_data: string | null;

  @IsDate()
  hold_in_time: Date | null;

  @IsDate()
  hold_out_time: Date | null;

  @IsString()
  time_taken: string;
}
