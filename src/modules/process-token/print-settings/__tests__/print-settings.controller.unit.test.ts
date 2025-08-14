import { HttpStatusCode } from 'axios';
import type { Request, NextFunction } from 'express';
import { type CustomResponse } from '@/types/common.type';
import PrintSettingsService from '../print-settings.service';
import PrintSettingsController from '../print-settings.controller';
import { PrintSettingsDto } from '../dto/print-settings.dto';
import { PrintSettingKeys } from '@prisma/client';

type MockCustomResponse<T> = Partial<CustomResponse<T>> & {
  locals: { currentUser: { id: string; name: string } };
};

describe('PrintSettingsController', () => {
  let mockService: jest.Mocked<PrintSettingsService>;
  let controller: PrintSettingsController;
  let mockReq: Partial<Request>;
  let mockRes: MockCustomResponse<PrintSettingsDto>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockService = {
      getPrintSettings: jest.fn(),
    } as unknown as jest.Mocked<PrintSettingsService>;

    controller = new PrintSettingsController(mockService);

    mockReq = {};
    mockRes = {
      locals: {
        currentUser: { id: 'user-1', name: 'user' },
      },
      send: jest.fn(),
    };

    jest.spyOn(controller as any, 'send').mockImplementation(jest.fn());

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return company print settings successfully.', async () => {
    const printSettings: PrintSettingsDto[] = [
      {
        id: 'hashId-1',
        setting_key: PrintSettingKeys.AVERAGE_WAITING_TIME,
        setting_value: '1',
      },
      {
        id: 'hashId-2',
        setting_key: PrintSettingKeys.COMPANY_TITLE_POS,
        setting_value: '1',
      },
    ];

    mockService.getPrintSettings.mockResolvedValue(printSettings);

    await controller.getPrintSettings(
      mockReq as Request,
      mockRes as CustomResponse<PrintSettingsDto>,
      mockNext
    );

    expect(mockService.getPrintSettings).toHaveBeenCalledWith(
      mockRes.locals.currentUser
    );
    expect(controller.send).toHaveBeenCalledWith(
      mockRes,
      printSettings,
      HttpStatusCode.Ok,
      'Print settings get sucessfully.'
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next with error when service throws', async () => {
    const error = new Error('DB error');
    mockService.getPrintSettings.mockRejectedValue(error);

    await controller.getPrintSettings(
      mockReq as Request,
      mockRes as CustomResponse<PrintSettingsDto>,
      mockNext
    );

    expect(mockService.getPrintSettings).toHaveBeenCalledWith(
      mockRes.locals.currentUser
    );
    expect(controller.send).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('should handle unexpected error', async () => {
  const unexpectedError = new Error('An unexpected error occurred');
  mockService.getPrintSettings.mockRejectedValue(unexpectedError);

  await controller.getPrintSettings(
    mockReq as Request,
    mockRes as CustomResponse<PrintSettingsDto>,
    mockNext
  );

  expect(mockService.getPrintSettings).toHaveBeenCalledWith(
    mockRes.locals.currentUser
  );
  expect(controller.send).not.toHaveBeenCalled();
  expect(mockNext).toHaveBeenCalledWith(unexpectedError);
});

});
