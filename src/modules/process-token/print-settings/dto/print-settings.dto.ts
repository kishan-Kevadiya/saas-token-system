import { PrintSettingKeys } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class PrintSettingsDto {
  @IsString()
  id: string;

  @IsEnum(PrintSettingKeys)
  setting_key: PrintSettingKeys;

  @IsString()
  setting_value: string;
}
