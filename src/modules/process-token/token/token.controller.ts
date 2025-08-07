import Api from '@/lib/api';
import TokenService from './token.service';
import { CustomResponse } from '@/types/common.type';
import { Request, NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
import { tokenDto } from './dto/token.dto';
import socketService from '@/socket/socket.service';
import { SocketNamespace } from '@/enums/socket.enum';

export default class TokenController extends Api {
  private readonly tokenService: TokenService;

  constructor(tokenService?: TokenService) {
    super();
    this.tokenService = tokenService ?? new TokenService();
  }

  public updateTokenStatus = async (
    req: Request,
    res: CustomResponse<tokenDto>,
    _next: NextFunction
  ) => {
    try {
     const token = await this.tokenService.updateTokenStatus(
        req.body,
        res.locals.currentUser,
        req.body.token_id as string,
      );

      const roomName = ''

      // socketService.emitToRoom(roomName, 'refresh', {
      //       token_id: req.body.token_id,
      //       message,
           
      //     },`/${SocketNamespace.PROCESS_TOKEN}`);

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
