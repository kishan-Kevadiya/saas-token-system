import AuthService from '../auth.service';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { generateJWTToken } from '@/utils/generate-jwt-token';
import { HttpBadRequestError } from '@/lib/errors';

jest.mock('@/lib/prisma', () => ({
  ht_company: {
    findFirst: jest.fn(),
  },
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

jest.mock('@/utils/generate-jwt-token', () => ({
  generateJWTToken: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService();
    jest.clearAllMocks();
  });

  describe('login', () => {
    const mockUser = {
      hash_id: 'user-hash-id',
      company_name: 'Test Company',
      fullname: 'John Doe',
      email: 'john@example.com',
      contact_no: '1234567890',
      username: 'john_doe',
      latitude: '12.34',
      longitude: '56.78',
      city: { hash_id: 'city-id', name: 'CityName' },
      state: { hash_id: 'state-id', name: 'StateName' },
      main_company: { hash_id: 'main-co-id', company_name: 'Main Co' },
      appointment_generate: true,
      saturday_off: false,
      sunday_off: true,
      is_generate_token_sms: true,
      is_print_token: false,
      is_download_token: true,
      created_at: new Date(),
      updated_at: new Date(),
      password: 'hashed-pass',
      asccode: 'ASC001',
    };

    it('should login successfully with valid credentials', async () => {
      (prisma.ht_company.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (generateJWTToken as jest.Mock).mockReturnValue('jwt-token');

      const result = await service.login({
        asccode: 'ASC001',
        password: 'password',
      });

      expect(prisma.ht_company.findFirst).toHaveBeenCalledWith({
        where: { asccode: 'ASC001', deleted_at: null },
        include: { main_company: true, city: true, state: true },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password',
        mockUser.password
      );
      expect(generateJWTToken).toHaveBeenCalledWith({
        sub: mockUser.hash_id,
        asccode: mockUser.asccode,
      });
      expect(result).toEqual({
        token: 'jwt-token',
        user: service.mapUserResponse(mockUser),
      });
    });

    it('should throw error if user not found', async () => {
      (prisma.ht_company.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.login({ asccode: 'invalid', password: 'pass' })
      ).rejects.toThrow(HttpBadRequestError);

      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw error if password is invalid', async () => {
      (prisma.ht_company.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ asccode: 'ASC001', password: 'wrongpass' })
      ).rejects.toThrow(HttpBadRequestError);

      expect(generateJWTToken).not.toHaveBeenCalled();
    });
  });

  describe('mapUserResponse', () => {
    it('should map user object to DTO correctly', () => {
      const user = {
        hash_id: 'id',
        company_name: 'Comp',
        fullname: 'Name',
        email: 'email@test.com',
        contact_no: '123',
        username: 'user',
        latitude: 'lat',
        longitude: 'long',
        city: { hash_id: 'cid', name: 'City' },
        state: { hash_id: 'sid', name: 'State' },
        main_company: { hash_id: 'mcid', company_name: 'Main' },
        appointment_generate: true,
        saturday_off: false,
        sunday_off: false,
        is_generate_token_sms: true,
        is_print_token: false,
        is_download_token: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = service.mapUserResponse(user);
      expect(result.company_name).toBe(user.company_name);
      expect(result.city).toEqual({ id: 'cid', name: 'City' });
      expect(result.state).toEqual({ id: 'sid', name: 'State' });
      expect(result.main_company).toEqual({ id: 'mcid', company_name: 'Main' });
    });

    it('should return null for city/state/main_company if not present', () => {
      const user = {
        hash_id: 'id',
        company_name: 'Comp',
        fullname: 'Name',
        email: 'email@test.com',
        contact_no: '123',
        username: 'user',
        latitude: 'lat',
        longitude: 'long',
        city: null,
        state: null,
        main_company: null,
        appointment_generate: true,
        saturday_off: false,
        sunday_off: false,
        is_generate_token_sms: true,
        is_print_token: false,
        is_download_token: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = service.mapUserResponse(user);
      expect(result.city).toBeNull();
      expect(result.state).toBeNull();
      expect(result.main_company).toBeNull();
    });
  });

  describe('getUserDetailsByHashId', () => {
    it('should return user details when found', async () => {
      const mockUser = { hash_id: 'id', company_name: 'Test' };
      (prisma.ht_company.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const spy = jest.spyOn(service, 'mapUserResponse').mockReturnValue({
        id: 'id',
        company_name: 'Test',
      } as any);

      const result = await service.getUserDetailsByHashId('id');
      expect(result).toEqual({ id: 'id', company_name: 'Test' });
      expect(spy).toHaveBeenCalledWith(mockUser);
    });

    it('should return null when user not found', async () => {
      (prisma.ht_company.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.getUserDetailsByHashId('id');
      expect(result).toBeNull();
    });
  });
});
