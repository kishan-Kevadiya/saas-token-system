"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_auth_controller_1 = __importDefault(require("../user-auth.controller"));
const user_auth_service_1 = __importDefault(require("../user-auth.service"));
const errors_1 = require("../../../../lib/errors");
const axios_1 = require("axios");
jest.mock("../user-auth.service");
describe("UserAuthController", () => {
    let controller;
    let service;
    let req;
    let res;
    let next;
    beforeEach(() => {
        service = new user_auth_service_1.default();
        controller = new user_auth_controller_1.default(service);
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
            await controller.login(req, res, next);
            expect(service.login).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(axios_1.HttpStatusCode.Ok);
            expect(res.json).toHaveBeenCalledWith({
                message: "Login successfully",
                data: mockUser,
            });
        });
        it("should pass error to next on failure", async () => {
            const error = new errors_1.HttpBadRequestError("Invalid credentials");
            service.login.mockRejectedValue(error);
            // @ts-ignore
            await controller.login(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });
    describe("getUserDetailsByToken", () => {
        it("should return current user from res.locals", async () => {
            const mockCurrentUser = {
                id: "1",
                name: "Test User",
                email: "test@example.com",
            };
            res.locals = { currentUser: mockCurrentUser };
            service.mapUserResponse.mockReturnValue(mockCurrentUser);
            // @ts-ignore
            await controller.getUserDetailsByToken(req, res, next);
            expect(service.mapUserResponse).toHaveBeenCalledWith(mockCurrentUser);
            expect(res.status).toHaveBeenCalledWith(axios_1.HttpStatusCode.Ok);
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
            await controller.getUserDetailsByToken(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
//# sourceMappingURL=user-auth.service.test.js.map