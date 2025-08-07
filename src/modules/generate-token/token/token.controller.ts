import { type Request, type NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
import TokenService from './token.service';
import Api from '@/lib/api';
import { type CustomResponse } from '@/types/common.type';
import socketService from '@/socket/socket.service';
import { SocketNamespace } from '@/enums/socket.enum';

export default class TokenController extends Api {
  private readonly tokenService: TokenService;

  constructor(tokenService?: TokenService) {
    super();
    this.tokenService = tokenService ?? new TokenService();
  }

  public generateToken = async (
    req: Request,
    res: CustomResponse<any>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = await this.tokenService.generateToken(req.body);
      const roomName = `company:${token.company_id}:series:${token.series_id}`;
      socketService.emitToRoom(
        roomName,
        'refresh',
        {
          token_id: token.hash_id,
          message: 'add token',
          timestamp: new Date(),
        },
        `/${SocketNamespace.PROCESS_TOKEN}`
      );
      this.send(res, token, HttpStatusCode.Ok, 'Token generated successfully');
    } catch (error) {
      next(error);
    }
  };

  public getTokensByCompany = async (
    req: Request,
    res: CustomResponse<any[]>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { date } = req.query;

      const tokens = await this.tokenService.getTokensByCompany(
        req.params.company_id,
        date as string
      );

      this.send(
        res,
        tokens,
        HttpStatusCode.Ok,
        'Tokens retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  };
}
