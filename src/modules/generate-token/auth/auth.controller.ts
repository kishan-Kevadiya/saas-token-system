import { type NextFunction, type Request } from 'express';
import { HttpStatusCode } from 'axios';
import AuthService from './auth.service';
import { type CurrentUserDto } from './dto/current-user.dto';
import { type CustomResponse } from '@/types/common.type';
import Api from '@/lib/api';
import { HttpBadRequestError, HttpUnAuthorizedError } from '@/lib/errors';

export default class AuthController extends Api {
  private readonly authService: AuthService;

  constructor(authService?: AuthService) {
    super();
    this.authService = authService ?? new AuthService();
  }

  public login = async (
    req: Request,
    res: CustomResponse<CurrentUserDto>,
    next: NextFunction
  ) => {
    try {
      const user = await this.authService.login(req.body);
      this.send(res, user, HttpStatusCode.Ok, 'Login successfully');
    } catch (e) {
      next(e);
    }
  };

  public generateToken = async (
    req: Request,
    res: CustomResponse<CurrentUserDto>,
    next: NextFunction
  ) => {
    try {
      const apiKey = req.headers['x-api-key'];
      if (!apiKey) {
        throw new HttpBadRequestError('Missing api key');
      }

      if (apiKey !== process.env.API_kEY) {
        throw new HttpUnAuthorizedError('Invalid api key');
      }

      const token = await this.authService.getToken(req.body);
      this.send(res, token, HttpStatusCode.Ok, 'Login successfully');
    } catch (e) {
      next(e);
    }
  };

  public getUserDetailsByToken = async (
    _req: Request,
    res: CustomResponse<CurrentUserDto>,
    next: NextFunction
  ) => {
    try {
      const currentUser = res.locals.currentUser;
      const userResponse = this.authService.mapUserResponse(currentUser);

      return this.send(res, userResponse, HttpStatusCode.Ok);
    } catch (e) {
      next(e);
    }
  };
}
