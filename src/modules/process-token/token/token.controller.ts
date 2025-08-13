import Api from '@/lib/api';
import TokenService from './token.service';
import { CustomResponse } from '@/types/common.type';
import { Request, NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
import { TokenDto } from './dto/token.dto';

export default class TokenController extends Api {
  private readonly tokenService: TokenService;

  constructor(tokenService?: TokenService) {
    super();
    this.tokenService = tokenService ?? new TokenService();
  }

  public updateTokenStatus = async (
    req: Request,
    res: CustomResponse<TokenDto>,
    _next: NextFunction
  ) => {
    try {
     const token = await this.tokenService.updateTokenStatus(
        req.body,
        res.locals.currentUser,
        req.body.token_id as string,
      );

      this.send(
        res,
        token,
        HttpStatusCode.Ok,
        'Token status updated successfully.'
      );
    } catch (e) {
     _next(e);
    }
  };
}
