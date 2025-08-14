import prisma from '@/lib/prisma';
import { type UserResponseDto } from '../user-auth/dto/current-user-auth.dto';
import { PrintSettingsDto } from './dto/print-settings.dto';

export default class PrintSettingsService {
  public async getPrintSettings(
    currentUser: UserResponseDto
  ): Promise<PrintSettingsDto[]> {
    const printSettings = await prisma.print_settings.findMany({
      where: {
        company_id: currentUser.company.id,
      },
      select: {
        hash_id: true,
        setting_key: true,
        setting_value: true,
      },
    });

    return printSettings.map((printSettings) => ({
      id: printSettings.hash_id,
      setting_key: printSettings.setting_key,
      setting_value: printSettings.setting_value,
    }));
  }
}
