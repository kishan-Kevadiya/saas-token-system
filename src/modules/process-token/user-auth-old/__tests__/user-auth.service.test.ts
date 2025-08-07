import { Request, Response, NextFunction } from "express";
import UserAuthController from "../user-auth.controller";
import UserAuthService from "../user-auth.service";
import { HttpBadRequestError } from "@/lib/errors";
import { HttpStatusCode } from "axios";
import { UserResponseDto } from "../dto/current-user-auth.dto";

jest.mock("../user-auth.service");

describe("UserAuthController", () => {
  let controller: UserAuthController;
  let service: jest.Mocked<UserAuthService>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    service = new UserAuthService() as jest.Mocked<UserAuthService>;
    controller = new UserAuthController(service);

    req = {
      body: {
        username: "testuser",
        password: "password",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {},
    };

    next = jest.fn();
  });

  describe("login", () => {
    it("should login successfully and return token and user", async () => {
      const mockUser = {
        token: "mock-token",
        user: { name: "Test User", email: "test@example.com" },
      };

      service.login.mockResolvedValue(mockUser);

      // @ts-ignore for CustomResponse
      await controller.login(req as Request, res as any, next);

      expect(service.login).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
      expect(res.json).toHaveBeenCalledWith({
        message: "Login successfully",
        data: mockUser,
      });
    });

    it("should pass error to next on failure", async () => {
      const error = new HttpBadRequestError("Invalid credentials");
      service.login.mockRejectedValue(error);

      // @ts-ignore
      await controller.login(req as Request, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getUserDetailsByToken", () => {
    it("should return current user from res.locals", async () => {
      const mockCurrentUser = {
        id: "1",
        name: "Test User",
        email: "test@example.com",
      } as unknown as UserResponseDto;

      res.locals = { currentUser: mockCurrentUser };
      service.mapUserResponse.mockReturnValue(mockCurrentUser as any);

      // @ts-ignore
      await controller.getUserDetailsByToken(req as Request, res as any, next);

      expect(service.mapUserResponse).toHaveBeenCalledWith(mockCurrentUser);
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
      expect(res.json).toHaveBeenCalledWith({
        message: "success",
        data: mockCurrentUser,
      });
    });

    it("should handle error and call next", async () => {
      res.locals = { currentUser: {} };
      const error = new Error("Something went wrong");

      service.mapUserResponse.mockImplementation(() => {
        throw error;
      });

      // @ts-ignore
      await controller.getUserDetailsByToken(req as Request, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
