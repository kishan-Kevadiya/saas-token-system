import { type UserResponseDto } from '../user-auth/dto/current-user-auth.dto';
import { type SettingsDto } from './dto/settings.dto';
import prisma from '@/lib/prisma';

export default class SettingsService {
  public async getSettings(currentUser: UserResponseDto): Promise<SettingsDto> {
    const [buttonSettings, counterSettings] = await Promise.all([
      prisma.ht_counter_settings.findMany({
        where: {
          company_id: currentUser.company.id,
          deleted_at: null,
        },
        select: {
          hash_id: true,
          counter: true,
        },
      }),

      prisma.ht_button_settings.findMany({
        where: {
          company_id: currentUser.company.id,
          deleted_at: null,
        },
        select: {
          hash_id: true,
          language_id: true,
          display_scroll: true,
          service_selection: true,
          srs_count: true,
          block_size: true,
          font_size: true,
          minutes_of_calling_before: true,
          display_transfer_token: true,
        },
      }),
    ]);

    return {
      button_settings: buttonSettings.map((buttonSetting) => ({
        id: buttonSetting.hash_id,
        counter: buttonSetting.counter,
      })),
      counter_settings: counterSettings.map((counterSetting) => ({
        id: counterSetting.hash_id,
        language_id: counterSetting.language_id,
        service_selection: counterSetting.service_selection,
        srs_count: counterSetting.srs_count,
        block_size: counterSetting.block_size,
        font_size: counterSetting.block_size,
        display_scroll: counterSetting.display_scroll,
        display_transfer_token: counterSetting.display_transfer_token,
        minutes_of_calling_before: counterSetting.minutes_of_calling_before,
      })),
    };
  }
}
