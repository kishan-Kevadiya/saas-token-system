import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { HttpStatusCode } from 'axios';
import TokenController from '../token.controller';
import TokenService from '../token.service';
import { TokenStatisticsResponseDto } from '../dto/token.dto';

describe('TokenController - getTokenStatistics', () => {
  let tokenServiceMock: jest.Mocked<TokenService>;
  let controller: TokenController;
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    tokenServiceMock = {
      getTokenStatistics: jest.fn(),
    } as any;

    controller = new TokenController(tokenServiceMock);

    req = {
      params: { company_id: '1', counter_id: '2' },
      query: { date: '2025-08-14' },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  it('should return token statistics successfully', async () => {
    const mockResponse: TokenStatisticsResponseDto = {
      series_data: [
        {
          series_id: 1,
          series_abbreviation: 'A',
          status_counts: {
            WAITING: 1,
            PENDING: 2,
            HOLD: 0,
            COMPLETED: 5,
            TRANSFER: 0,
            ACTIVE: 1,
          },
          total: 9,
        },
      ],
      overall_totals: {
        WAITING: { count: 1, tokens: [] },
        PENDING: { count: 2, tokens: [] },
        HOLD: { count: 0, tokens: [] },
        COMPLETED: { count: 5, tokens: [] },
        TRANSFER: { count: 0, tokens: [] },
        ACTIVE: { count: 1, tokens: [] },
        total: 9,
      },
      company_info: { company_id: 1 },
      counter_info: { counter_id: 2 },
      filter_date: '2025-08-14',
      statistics_meta: {
        total_series: 1,
        generated_at: new Date().toISOString(),
      },
    } as any;

    tokenServiceMock.getTokenStatistics.mockResolvedValue(mockResponse as any);

    await controller.getTokenStatistics(req, res, next);

    expect(tokenServiceMock.getTokenStatistics).toHaveBeenCalledWith(
      '1',
      '2',
      '2025-08-14'
    );
    const dtoInstance = plainToInstance(
      TokenStatisticsResponseDto,
      mockResponse
    );
    const errors = validateSync(dtoInstance, { whitelist: true });
    expect(errors).toHaveLength(0);

    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
  });

  it('should handlr unexpected errors', async () => {
    const error = new Error('Service failed');
    tokenServiceMock.getTokenStatistics.mockRejectedValue(error);

    await controller.getTokenStatistics(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });
});
