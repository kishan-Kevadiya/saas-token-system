import { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "axios";
import UserAuthController from "../user-auth.controller";
import UserAuthService from "../user-auth.service";
import { UserResponseDto } from "../dto/current-user-auth.dto";

describe("UserAuthController", () => {
  let controller: UserAuthController;
  let service: jest.Mocked<UserAuthService>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let sendMock: jest.Mock;

  beforeEach(() => {
    service = {
      login: jest.fn(),
      mapUserResponse: jest.fn(),
    } as any;

    controller = new UserAuthController(service);

    sendMock = jest.fn();
    (controller as any).send = sendMock;

    req = {};
    res = {
      locals: {},
    };
    next = jest.fn();
  });

  describe("login", () => {
    it("should return user data on successful login", async () => {
      req.body = { email: "test@example.com", password: "password" };

      const mockUser = { id: 1, name: "Test User" } as UserResponseDto;
      service.login.mockResolvedValue(mockUser);

      await controller.login(req as Request, res as Response, next);

      expect(service.login).toHaveBeenCalledWith(req.body);
      expect(sendMock).toHaveBeenCalledWith(
        res,
        mockUser,
        HttpStatusCode.Ok,
        "Login successfully"
      );
    });

    it("should call next with error on login failure", async () => {
      const error = new Error("Invalid credentials");
      service.login.mockRejectedValue(error);

      req.body = { email: "wrong@example.com", password: "wrong" };

      await controller.login(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getUserDetailsByToken", () => {
    it("should return mapped user data from token", async () => {
      const currentUser: UserResponseDto = {
        id: 1,
        name: "Token User",
        email: "token@example.com",
        contact_no: "9876543210",
        username: "tokenuser",
        counter_details: null,
        data: null,
        ip: "127.0.0.1",
        is_active: 1,
        company: {
          id: 1,
          hash_id: "company-123",
          company_name: "Test Co",
        },
        department: {
          id: "dept-456",
          dept_english_name: "IT",
          dept_hindi_name: "hindi",
          dept_regional_name: "regional",
        },
        created_at: new Date(),
        updated_at: null,
      };

      const mappedUser = {
        id: 1,
        name: "Mapped User",
      } as any as UserResponseDto;

      const res = {
        locals: {
          currentUser: {
            id: 1,
            name: "Test User",
            email: "test@example.com",
            contact_no: "1234567890",
            username: "testuser",
            data: null,
            counter_details: null,
            ip: "127.0.0.1",
            is_active: 1,
            company: {
              id: 101,
              company_name: "Test Company",
            },
            department: {
              id: "dept-001",
              dept_english_name: "IT",
              dept_hindi_name: "hindi",
              dept_regional_name: "regional",
            },
            created_at: new Date(),
            updated_at: null,
          } as UserResponseDto,
        },
      } as unknown as Response;
      service.mapUserResponse.mockReturnValue(mappedUser as any);

      await controller.getUserDetailsByToken(
        req as Request,
        res as Response,
        next
      );

      expect(service.mapUserResponse).toHaveBeenCalledWith(
        res.locals.currentUser
      );
      expect(sendMock).toHaveBeenCalledWith(res, mappedUser, HttpStatusCode.Ok);
    });

    it("should call next with error if mapping fails", async () => {
      const error = new Error("Token error");
      const res = {
        locals: {
          currentUser: {
            id: 1,
            name: "Test User",
            email: "test@example.com",
            contact_no: "1234567890",
            username: "testuser",
            data: null,
            counter_details: null,
            ip: "127.0.0.1",
            is_active: 1,
            company: {
              id: 101,
              company_name: "Test Company",
            },
            department: {
              id: "dept-001",
              dept_english_name: "IT",
              dept_hindi_name: "hindi",
              dept_regional_name: "regional",
            },
            created_at: new Date(),
            updated_at: null,
          } as UserResponseDto,
        },
      } as unknown as Response;

      service.mapUserResponse.mockImplementation(() => {
        throw error;
      });

      await controller.getUserDetailsByToken(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
