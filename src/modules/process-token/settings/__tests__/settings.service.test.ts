import SettingsService from '../settings.service';
import { type UserResponseDto } from '../../user-auth/dto/current-user-auth.dto';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  ht_counter_settings: {
    findMany: jest.fn(),
  },
  ht_button_settings: {
    findMany: jest.fn(),
  },
}));

describe('SettingsService', () => {
  const service = new SettingsService();

  const mockUser: UserResponseDto = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    company: {
      id: 101,
      company_name: 'Test Company',
    },
    department: {
      id: 202,
      dept_english_name: 'english_name',
      dept_hindi_name: 'hindi_name',
      dept_regional_name: 'regional_name',
    },
    contact_no: '7845122145',
    username: 'user_name',
    data: undefined,
    counter: undefined,
    ip: '21.21.1',
    is_active: 0,
    created_at: new Date(),
    updated_at: null,
  };

  const mockButtonSettings = [
    { hash_id: 'btn_1', counter_width: 3 },
    { hash_id: 'btn_2', counter_width: 5 },
  ];

  const mockCounterSettings = [
    { hash_id: 'ctr_1', display_scroll: true, display_transfer_token: false },
    { hash_id: 'ctr_2', display_scroll: false, display_transfer_token: true },
  ];

  it('should return settings successfully', async () => {
    (prisma.ht_button_settings.findMany as jest.Mock).mockResolvedValue(
      mockButtonSettings
    );
    (prisma.ht_counter_settings.findMany as jest.Mock).mockResolvedValue(
      mockCounterSettings
    );

    const result = await service.getSettings(mockUser);

    expect(prisma.ht_button_settings.findMany).toHaveBeenCalledWith({
      where: {
        company_id: 101,
        deleted_at: null,
      },
      select: {
        hash_id: true,
        display_scroll: true,
        display_transfer_token: true,
        block_size: true,
        font_size: true,
        language_id: true,
        service_selection: true,
        minutes_of_calling_before: true,
        srs_count: true,
      },
    });

    expect(prisma.ht_counter_settings.findMany).toHaveBeenCalledWith({
      where: {
        company_id: 101,
        deleted_at: null,
      },
      select: {
        hash_id: true,
        counter: true,
      },
    });

    expect(result).toEqual({
      button_settings: [
        { id: 'ctr_1', counter_width: undefined },
        { id: 'ctr_2', counter_width: undefined },
      ],
      counter_settings: [
        {
          id: 'btn_1',
          display_scroll: undefined,
          display_transfer_token: undefined,
        },
        {
          id: 'btn_2',
          display_scroll: undefined,
          display_transfer_token: undefined,
        },
      ],
    });
  });

  it('should return empty arrays if no settings found', async () => {
    (prisma.ht_button_settings.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.ht_counter_settings.findMany as jest.Mock).mockResolvedValue([]);

    const result = await service.getSettings(mockUser);

    expect(result).toEqual({
      button_settings: [],
      counter_settings: [],
    });
  });
});
