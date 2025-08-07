import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

export class ButtonSettings {
  @IsString()
  id: string;

  @IsNumber()
  counter: number | null;
}

export class CounterSettings {
  @IsString()
  id: string;

  @IsString()
  language_id: string;

  @IsNumber()
  service_selection: number;

  @IsNumber()
  srs_count: number | null;

  @IsNumber()
  font_size: number | null;

  @IsNumber()
  block_size: number | null;

  @IsNumber()
  display_scroll: number;

  @IsString()
  display_transfer_token: string;

  @IsString()
  minutes_of_calling_before: string | null;
}

export class SettingsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ButtonSettings)
  button_settings: ButtonSettings[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CounterSettings)
  counter_settings: CounterSettings[];
}
