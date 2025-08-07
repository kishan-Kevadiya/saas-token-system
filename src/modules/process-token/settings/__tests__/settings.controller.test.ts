import { HttpStatusCode } from 'axios';
import SettingsController from '../settings.controller';
import type SettingsService from '../settings.service';
import { type SettingsDto } from '../dto/settings.dto';

describe('SettingsController', () => {
  let controller: SettingsController;
  let mockService: jest.Mocked<SettingsService>;
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    mockService = {
      getSettings: jest.fn(),
    } as unknown as jest.Mocked<SettingsService>;

    controller = new SettingsController(mockService);

    req = {};
    res = {
      locals: {
        currentUser: { id: 1, company: { id: 10 }, name: 'Test User' },
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    (controller as any).send = jest.fn();

    next = jest.fn();
  });

  it('should return settings successfully', async () => {
    const mockSettings: SettingsDto = {
      button_settings: [],
      counter_settings: [],
    };

    mockService.getSettings.mockResolvedValue(mockSettings);

    await controller.getSettings(req, res, next);

    expect(mockService.getSettings).toHaveBeenCalledWith(
      res.locals.currentUser
    );

    expect((controller as any).send).toHaveBeenCalledWith(
      res,
      mockSettings,
      HttpStatusCode.Ok,
      'Settings get sucessfully.'
    );
  });

  it('should handle errors and return 500', async () => {
    const error = new Error('Something failed');

    mockService.getSettings.mockRejectedValue(error);

    await controller.getSettings(req, res, next);

    expect((controller as any).send).toHaveBeenCalledWith(
      res,
      null,
      HttpStatusCode.InternalServerError,
      'An unexpected error occurred',
      error
    );
  });
});
