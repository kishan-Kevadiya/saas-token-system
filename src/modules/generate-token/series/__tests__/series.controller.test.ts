import { HttpStatusCode } from 'axios';
import { type Request, type Response, type NextFunction } from 'express';
import SeriesController from '../series.controller';
import type SeriesService from '../series.service';
import {
  type GenerateTokenSeriesDto,
  type GenerateTokenSubSeriesResponseDto,
} from '../dto/series.dto';

describe('SeriesController', () => {
  let seriesService: SeriesService;
  let controller: SeriesController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    seriesService = {
      getTopLevelSeries: jest.fn(),
      getSubSeries: jest.fn(),
    } as unknown as SeriesService;

    controller = new SeriesController(seriesService);

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('getSeries', () => {
    it('should return series successfully', async () => {
      const mockSeriesData: GenerateTokenSeriesDto[] = [
        {
          id: 'id1',
          series_name: 'series',
          series_image: null,
          title: ''
        },
      ];

      mockReq = {
        params: {
          company_id: 'c1',
          langauge_id: 'l1',
        },
      };

      (seriesService.getTopLevelSeries as jest.Mock).mockResolvedValue(
        mockSeriesData
      );

      const sendSpy = jest.spyOn(controller as any, 'send');

      await controller.getSeries(mockReq as Request, mockRes as any, mockNext);

      expect(seriesService.getTopLevelSeries).toHaveBeenCalledWith('c1', 'l1');
      expect(sendSpy).toHaveBeenCalledWith(
        mockRes,
        mockSeriesData,
        HttpStatusCode.Ok,
        'Series retrieved successfully'
      );
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Something went wrong');
      mockReq = {
        params: {
          company_id: 'c1',
          langauge_id: 'l1',
        },
      };

      (seriesService.getTopLevelSeries as jest.Mock).mockRejectedValue(error);

      await controller.getSeries(mockReq as Request, mockRes as any, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getSubSeries', () => {
    it('should return sub-series successfully', async () => {
      const mockSubSeriesData: GenerateTokenSubSeriesResponseDto[] = [
        {
          id: 'id1',
          sub_series_present: false,
          display_form: 0,
          form_data: null,
          series: null,
        },
      ];

      mockReq = {
        params: {
          series_id: 's1',
          langauge_id: 'l1',
        },
      };

      (seriesService.getSubSeries as jest.Mock).mockResolvedValue(
        mockSubSeriesData
      );

      const sendSpy = jest.spyOn(controller as any, 'send');

      await controller.getSubSeries(
        mockReq as Request,
        mockRes as any,
        mockNext
      );

      expect(seriesService.getSubSeries).toHaveBeenCalledWith('s1', 'l1');
      expect(sendSpy).toHaveBeenCalledWith(
        mockRes,
        mockSubSeriesData,
        HttpStatusCode.Ok,
        'Sub-series data retrieved successfully'
      );
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Sub-series error');
      mockReq = {
        params: {
          series_id: 's1',
          langauge_id: 'l1',
        },
      };

      (seriesService.getSubSeries as jest.Mock).mockRejectedValue(error);

      await controller.getSubSeries(
        mockReq as Request,
        mockRes as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
