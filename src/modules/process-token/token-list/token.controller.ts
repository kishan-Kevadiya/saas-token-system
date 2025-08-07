import { type Request, type NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
import TokenService from './token.service';
import Api from '@/lib/api';
import { type CustomResponse } from '@/types/common.type';

export default class TokenController extends Api {
  private readonly tokenService: TokenService;

  constructor(tokenService?: TokenService) {
    super();
    this.tokenService = tokenService ?? new TokenService();
  }

  public getTokenStatistics = async (
    req: Request,
    res: CustomResponse<any>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { date } = req.query;

      const statistics = await this.tokenService.getTokenStatistics(
        req.params.company_id,
        req.params.counter_id,
        date as string
      );

      this.send(
        res,
        statistics,
        HttpStatusCode.Ok,
        'Token statistics retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  };
}
