import { type Request, type Response, type NextFunction } from 'express';
import AuthController from '../auth.controller';
import AuthService from '../auth.service';
import { type CurrentUserDto } from '../dto/current-user.dto';

jest.mock('../auth.service');

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;
  let mockReq: Partial<Request>;
  let mockRes: Response & { locals: { currentUser?: unknown } };
  let mockNext: jest.MockedFunction<NextFunction>;
  let sendSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new AuthService() as jest.Mocked<AuthService>;
    controller = new AuthController(service);

    mockReq = {
      body: {
        asccode: 'ASC123',
        password: 'secret',
      },
    };

    mockRes = {
      locals: {},
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response & { locals: { currentUser?: unknown } };

    mockNext = jest.fn();
    sendSpy = jest.spyOn(controller as any, 'send');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return token and user on successful login', async () => {
      const mockUser: CurrentUserDto = {
        id: 1,
        company_name: 'Test Co',
        email: 'test@example.com',
        contact_no: '1234567890',
        username: 'testuser',
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
        hash_id: '',
      };

      const mockToken = 'jwt.token.string';
      service.login.mockResolvedValue({ token: mockToken, user: mockUser });

      await controller.login(mockReq as Request, mockRes, mockNext);

      expect(service.login).toHaveBeenCalledWith(mockReq.body);
      expect(sendSpy).toHaveBeenCalledWith(
        mockRes,
        { token: mockToken, user: mockUser },
        200,
        'Login successfully.'
      );
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Invalid credentials');
      service.login.mockRejectedValue(error);

      await controller.login(mockReq as Request, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserDetailsByToken', () => {
    it('should return  user successfully.', async () => {
      const currentUser = {
        hash_id: '1',
        company_name: 'Test Co',
        fullname: 'Jane Doe',
        email: 'jane@example.com',
        contact_no: '1234567890',
        username: 'janedoe',
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
      };

      const mappedUser: CurrentUserDto = {
        id: 1,
        company_name: 'Test Co',
        email: 'jane@example.com',
        contact_no: '1234567890',
        username: 'janedoe',
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
        created_at: currentUser.created_at,
        updated_at: null,
        hash_id: '',
      };

      mockRes.locals.currentUser = currentUser;
      service.mapUserResponse.mockReturnValue(mappedUser as any);

      await controller.getUserDetailsByToken({} as any, mockRes, mockNext);

      expect(service.mapUserResponse).toHaveBeenCalledWith(currentUser);
      expect(sendSpy).toHaveBeenCalledWith(
        mockRes,
        mappedUser,
        200,
        'User details fetched successfully.'
      );
    });

    it('should handle unexpected error  ', async () => {
      const error = new Error('Mapping error');
      mockRes.locals.currentUser = {};
      service.mapUserResponse.mockImplementation(() => {
        throw error;
      });

      await controller.getUserDetailsByToken({} as any, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
