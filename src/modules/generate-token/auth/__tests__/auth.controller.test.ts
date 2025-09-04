import { type Request, type Response, type NextFunction } from 'express';
import AuthController from '../auth.controller';
import AuthService from '../auth.service';
import { type CurrentUserDto } from '../dto/current-user.dto';

jest.mock('../auth.service');

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response> & { locals: any };
  let mockNext: jest.MockedFunction<NextFunction>;
  let sendSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new AuthService() as jest.Mocked<AuthService>;
    controller = new AuthController(service);

    mockReq = { body: { email: 'test@example.com', password: 'secret' } };

    mockRes = {
      locals: {},
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
    sendSpy = jest.spyOn(controller as any, 'send');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should log in and return user details', async () => {
      const user: CurrentUserDto = {
        id: 1,
        email: 'test@example.com',
        company_name: '',
        contact_no: null,
        username: null,
        latitude: null,
        longitude: null,
        city: null,
        state: null,
        main_company: null,
        appointment_generate: 0,
        saturday_off: 0,
        sunday_off: 0,
        is_generate_token_sms: 0,
        is_print_token: 0,
        is_download_token: 0,
        created_at: new Date(),
        updated_at: null,
        hash_id: ''
      };

      service.login.mockResolvedValue(user);

      await controller.login(mockReq as Request, mockRes as Response, mockNext);

      expect(service.login).toHaveBeenCalledWith(mockReq.body);
      expect(sendSpy).toHaveBeenCalledWith(
        mockRes,
        user,
        200,
        'Login successfully'
      );
    });

    it('should handle invalid credentials error', async () => {
      const error = new Error('Invalid credentials');
      service.login.mockRejectedValue(error);

      await controller.login(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserDetailsByToken', () => {
    it('should return login user details', async () => {
      const currentUser = {
        id: 1,
        name: 'Jane Doe',
        email: 'jane@example.com',
      };

      const mappedUser: CurrentUserDto = {
        id: '1',
        company_name: 'company-1',
        email: null,
        contact_no: null,
        username: null,
        latitude: null,
        longitude: null,
        city: null,
        state: null,
        main_company: null,
        appointment_generate: 0,
        saturday_off: 0,
        sunday_off: 0,
        is_generate_token_sms: 0,
        is_print_token: 0,
        is_download_token: 0,
        created_at: new Date(),
        updated_at: null,
      } as any;

      mockRes.locals.currentUser = currentUser;
      service.mapUserResponse.mockReturnValue(mappedUser as any);

      await controller.getUserDetailsByToken(
        {} as any,
        mockRes as Response,
        mockNext
      );

      expect(service.mapUserResponse).toHaveBeenCalledWith(currentUser);
      expect(sendSpy).toHaveBeenCalledWith(mockRes, mappedUser, 200);
    });

    it('should return an unexpected error', async () => {
      service.mapUserResponse.mockImplementation(() => {
        throw new Error('Mapping failed');
      });

      mockRes.locals.currentUser = {};

      await controller.getUserDetailsByToken(
        {} as any,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
