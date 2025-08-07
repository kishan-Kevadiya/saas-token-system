import Api from "@/lib/api";
import AuthService from "./auth.service";
import { CustomResponse } from "@/types/common.type";
import { type NextFunction, type Request } from 'express';
import { HttpStatusCode } from "axios";
import { CurrentUserDto } from "./dto/current-user.dto";

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
      next(e)
    }
  };

    public getUserDetailsByToken = async (
    _req: Request,
    res: CustomResponse<CurrentUserDto>,
    next: NextFunction
  ) => {
    try {
      const currentUser = res.locals.currentUser;
      const userResponse = this.authService.mapUserResponse(
        currentUser,
      );

      return this.send(res, userResponse, HttpStatusCode.Ok);
    } catch (e) {
      next(e)
    }
  };
}
