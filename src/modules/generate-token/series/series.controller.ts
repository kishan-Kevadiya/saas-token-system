import { type Request, type NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
import SeriesService from './series.service';
import {
  type GenerateTokenSeriesDto,
  type GenerateTokenSubSeriesResponseDto,
} from './dto/series.dto';
import Api from '@/lib/api';
import { type CustomResponse } from '@/types/common.type';

export default class SeriesController extends Api {
  private readonly seriesService: SeriesService;

  constructor(seriesService?: SeriesService) {
    super();
    this.seriesService = seriesService ?? new SeriesService();
  }

  public getSeries = async (
    req: Request,
    res: CustomResponse<GenerateTokenSeriesDto[]>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const series = await this.seriesService.getTopLevelSeries(
        req.params.company_id,
        req.params.langauge_id
      );
      this.send(
        res,
        series,
        HttpStatusCode.Ok,
        'Series retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  };

  public getSubSeries = async (
    req: Request,
    res: CustomResponse<GenerateTokenSubSeriesResponseDto[]>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const subSeriesData = await this.seriesService.getSubSeries(
        req.params.series_id,
        req.params.langauge_id
      );
      this.send(
        res,
        subSeriesData,
        HttpStatusCode.Ok,
        'Sub-series data retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  };
}
