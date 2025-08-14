import AuthService from '../auth.service';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { generateJWTToken } from '@/utils/generate-jwt-token';
import { HttpBadRequestError } from '@/lib/errors';

jest.mock('@/lib/prisma', () => ({
  ht_company: { findFirst: jest.fn() },
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
    const mockData = { asccode: 'A123', password: 'pass123' };
    const mockUserFromDb = {
      id: 1,
      hash_id: 'hash-1',
      company_name: 'Test Co',
      fullname: 'John Doe',
      email: 'test@example.com',
      contact_no: '1234567890',
      username: 'john',
      latitude: '10.00',
      longitude: '20.00',
      city: { hash_id: 'c1', name: 'City' },
      state: { hash_id: 's1', name: 'State' },
      main_company: { hash_id: 'mc1', company_name: 'Main Co' },
      appointment_generate: true,
      saturday_off: false,
      sunday_off: false,
      is_generate_token_sms: true,
      is_print_token: true,
      is_download_token: false,
      created_at: new Date(),
      updated_at: new Date(),
      password: 'hashedPassword',
      asccode: 'A123',
    };

    it('should login successfully and return token + mapped user', async () => {
      (prisma.ht_company.findFirst as jest.Mock).mockResolvedValue(mockUserFromDb);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (generateJWTToken as jest.Mock).mockReturnValue('jwt.token');

      const result = await service.login(mockData);

      expect(prisma.ht_company.findFirst).toHaveBeenCalledWith({
        where: { asccode: mockData.asccode, deleted_at: null },
        include: { main_company: true, city: true, state: true },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(mockData.password, mockUserFromDb.password);
      expect(generateJWTToken).toHaveBeenCalledWith({
        sub: mockUserFromDb.hash_id,
        asccode: mockUserFromDb.asccode,
      });

      expect(result).toEqual({
        token: 'jwt.token',
        user: service.mapUserResponse(mockUserFromDb),
      });
    });

    it('should throw if user not found', async () => {
      (prisma.ht_company.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.login(mockData)).rejects.toThrow(
        new HttpBadRequestError('Invalid credential!')
      );
    });

    it('should throw if password is invalid', async () => {
      (prisma.ht_company.findFirst as jest.Mock).mockResolvedValue(mockUserFromDb);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(mockData)).rejects.toThrow(
        new HttpBadRequestError('Invalid credentials!')
      );
    });
  });

  describe('mapUserResponse', () => {
    it('should map user with all relations', () => {
      const user = {
        id: 1,
        hash_id: 'h1',
        company_name: 'Company',
        fullname: 'John Doe',
        email: 'email@test.com',
        contact_no: '123',
        username: 'john',
        latitude: '1',
        longitude: '2',
        city: { hash_id: 'c1', name: 'City' },
        state: { hash_id: 's1', name: 'State' },
        main_company: { hash_id: 'm1', company_name: 'Main' },
        appointment_generate: true,
        saturday_off: false,
        sunday_off: false,
        is_generate_token_sms: true,
        is_print_token: false,
        is_download_token: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mapped = service.mapUserResponse(user as any);
      expect(mapped.city).toEqual({ id: 'c1', name: 'City' });
      expect(mapped.state).toEqual({ id: 's1', name: 'State' });
      expect(mapped.main_company).toEqual({ id: 'm1', company_name: 'Main' });
    });

    it('should handle null city/state/main_company', () => {
      const user = {
        id: 1,
        hash_id: 'h1',
        company_name: 'Company',
        fullname: 'John Doe',
        email: 'email@test.com',
        contact_no: '123',
        username: 'john',
        latitude: '1',
        longitude: '2',
        city: null,
        state: null,
        main_company: null,
        appointment_generate: false,
        saturday_off: true,
        sunday_off: true,
        is_generate_token_sms: false,
        is_print_token: false,
        is_download_token: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mapped = service.mapUserResponse(user as any);
      expect(mapped.city).toBeNull();
      expect(mapped.state).toBeNull();
      expect(mapped.main_company).toBeNull();
    });
  });

  describe('getUserDetailsByHashId', () => {
    it('should return mapped user when found', async () => {
      const mockUser = { id: 1, hash_id: 'h1', company_name: 'Co', password: 'x' };
      jest.spyOn(service, 'mapUserResponse').mockReturnValue({ id: 'mapped' } as any);
      (prisma.ht_company.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getUserDetailsByHashId('h1');

      expect(prisma.ht_company.findFirst).toHaveBeenCalledWith({
        where: { hash_id: 'h1', deleted_at: null },
        include: { main_company: true, city: true, state: true },
      });
      expect(result).toEqual({ id: 'mapped' });
    });

    it('should return null if user not found', async () => {
      (prisma.ht_company.findFirst as jest.Mock).mockResolvedValue(null);
      const result = await service.getUserDetailsByHashId('h1');
      expect(result).toBeNull();
    });
  });
});
