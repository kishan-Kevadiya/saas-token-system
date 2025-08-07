import Api from "@/lib/api";
import UserAuthService from "./user-auth.service";
import { CustomResponse } from "@/types/common.type";
import { CurrentUserDto } from "../company-auth/dto/current-user.dto";
import { NextFunction, Request } from "express";
import { HttpStatusCode } from "axios";
import { CompanyTokenManager } from "@/utils/redis-token-manager";

export default class UserAuthController extends Api {
  private readonly userAuthService: UserAuthService;

  constructor(userAuthService?: UserAuthService) {
    super();
    this.userAuthService = userAuthService ?? new UserAuthService();
  }

  public login = async (
    req: Request,
    res: CustomResponse<CurrentUserDto>,
    next: NextFunction
  ) => {
    try {
      const user = await this.userAuthService.login(req.body, res.locals.currentUser);
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
      const userResponse = this.userAuthService.mapUserResponse(
        currentUser,
      );

      return this.send(res, userResponse, HttpStatusCode.Ok);
    } catch (e) {
      next(e)
    }
  };
}
