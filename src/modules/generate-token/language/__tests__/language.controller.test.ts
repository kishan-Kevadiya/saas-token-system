import { HttpStatusCode } from 'axios';
import LanguageController from '../language.controller';
import type LanguageService from '../language.service';

describe('LanguageController', () => {
  let controller: LanguageController;
  let mockService: jest.Mocked<LanguageService>;
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    mockService = {
      getLanguagesByCompanyId: jest.fn(),
    } as unknown as jest.Mocked<LanguageService>;

    controller = new LanguageController(mockService);

    req = {
      params: {
        company_id: '123',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    (controller as any).send = jest.fn();

    next = jest.fn();
  });

  it('should return languages successfully', async () => {
    const mockLanguages = [
      { id: 'lang_1', name: 'English', code: 'en', title: 'title' },
      { id: 'lang_2', name: 'Hindi', code: 'hi', title: 'title' },
    ];

    mockService.getLanguagesByCompanyId.mockResolvedValue(mockLanguages);

    await controller.getLanguages(req, res, next);

    expect(mockService.getLanguagesByCompanyId).toHaveBeenCalledWith('123');
    expect((controller as any).send).toHaveBeenCalledWith(
      res,
      mockLanguages,
      HttpStatusCode.Ok,
      'Languages retrieved successfully'
    );
  });

  it('should handle errors', async () => {
    const error = new Error('Database error');
    mockService.getLanguagesByCompanyId.mockRejectedValue(error);

    await controller.getLanguages(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
