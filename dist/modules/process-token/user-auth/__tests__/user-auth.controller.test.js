"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const user_auth_controller_1 = __importDefault(require("../user-auth.controller"));
describe("UserAuthController", () => {
    let controller;
    let service;
    let req;
    let res;
    let next;
    let sendMock;
    beforeEach(() => {
        service = {
            login: jest.fn(),
            mapUserResponse: jest.fn(),
        };
        controller = new user_auth_controller_1.default(service);
        sendMock = jest.fn();
        controller.send = sendMock;
        req = {};
        res = {
            locals: {},
        };
        next = jest.fn();
    });
    describe("login", () => {
        it("should return user data on successful login", async () => {
            req.body = { email: "test@example.com", password: "password" };
            const mockUser = { id: 1, name: "Test User" };
            service.login.mockResolvedValue(mockUser);
            await controller.login(req, res, next);
            expect(service.login).toHaveBeenCalledWith(req.body);
            expect(sendMock).toHaveBeenCalledWith(res, mockUser, axios_1.HttpStatusCode.Ok, "Login successfully");
        });
        it("should call next with error on login failure", async () => {
            const error = new Error("Invalid credentials");
            service.login.mockRejectedValue(error);
            req.body = { email: "wrong@example.com", password: "wrong" };
            await controller.login(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });
    describe("getUserDetailsByToken", () => {
        it("should return mapped user data from token", async () => {
            const currentUser = {
                id: 1,
                name: "Token User",
                email: "token@example.com",
                contact_no: "9876543210",
                username: "tokenuser",
                data: null,
                counter: null,
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
            };
            const res = {
                locals: {
                    currentUser: {
                        id: 1,
                        name: "Test User",
                        email: "test@example.com",
                        contact_no: "1234567890",
                        username: "testuser",
                        data: null,
                        counter: null,
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
                    },
                },
            };
            service.mapUserResponse.mockReturnValue(mappedUser);
            await controller.getUserDetailsByToken(req, res, next);
            expect(service.mapUserResponse).toHaveBeenCalledWith(res.locals.currentUser);
            expect(sendMock).toHaveBeenCalledWith(res, mappedUser, axios_1.HttpStatusCode.Ok);
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
                        counter: null,
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
                    },
                },
            };
            service.mapUserResponse.mockImplementation(() => {
                throw error;
            });
            await controller.getUserDetailsByToken(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
//# sourceMappingURL=user-auth.controller.test.js.map