import prisma from '@/lib/prisma';
import PrintSettingsService from '../print-settings.service';
import { UserResponseDto } from '../../user-auth/dto/current-user-auth.dto';
import { PrintSettingsDto } from '../dto/print-settings.dto';
import { PrintSettingKeys } from '@prisma/client';
jest.mock('@/lib/prisma', () => ({
  print_settings: {
    findMany: jest.fn(),
  },
}));

describe('PrintSettingsService', () => {
  let service: PrintSettingsService;
  let mockCurrentUser: UserResponseDto;

  beforeEach(() => {
    service = new PrintSettingsService();
    mockCurrentUser = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      company: {
        id: 'company-456',
        name: 'Test Company',
      },
    } as unknown as UserResponseDto;
    jest.clearAllMocks();
  });

  it('should return print settings for company successfully', async () => {
    const mockDbResults = [
      {
        hash_id: 'hash-1',
        setting_key: PrintSettingKeys.AVERAGE_WAITING_TIME,
        setting_value: '1',
      },
      {
        hash_id: 'hash-2',
        setting_key: PrintSettingKeys.BARCODE_WIDTH,
        setting_value: '1',
      },
    ];

    (prisma.print_settings.findMany as jest.Mock).mockResolvedValue(
      mockDbResults
    );

    const result = await service.getPrintSettings(mockCurrentUser);

    expect(prisma.print_settings.findMany).toHaveBeenCalledWith({
      where: { company_id: mockCurrentUser.company.id },
      select: {
        hash_id: true,
        setting_key: true,
        setting_value: true,
      },
    });

    expect(result).toEqual<PrintSettingsDto[]>([
      {
        id: 'hash-1',
        setting_key: PrintSettingKeys.AVERAGE_WAITING_TIME,
        setting_value: '1',
      },
      {
        id: 'hash-2',
        setting_key: PrintSettingKeys.BARCODE_WIDTH,
        setting_value: '1',
      },
    ]);
  });

  it('should return an empty array when no settings found', async () => {
    (prisma.print_settings.findMany as jest.Mock).mockResolvedValue([]);

    const result = await service.getPrintSettings(mockCurrentUser);

    expect(result).toEqual([]);
    expect(prisma.print_settings.findMany).toHaveBeenCalledTimes(1);
  });

  it('should throw an unexpected error', async () => {
    const unexpectedError = new Error('An unexpected error occurred');
    (prisma.print_settings.findMany as jest.Mock).mockRejectedValue(
      unexpectedError
    );

    await expect(service.getPrintSettings(mockCurrentUser)).rejects.toThrow(
      'An unexpected error occurred'
    );

    expect(prisma.print_settings.findMany).toHaveBeenCalledWith({
      where: { company_id: mockCurrentUser.company.id },
      select: {
        hash_id: true,
        setting_key: true,
        setting_value: true,
      },
    });
  });
});
