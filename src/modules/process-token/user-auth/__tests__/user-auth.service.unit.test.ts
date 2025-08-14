import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { HttpBadRequestError } from '@/lib/errors';
import { generateJWTToken } from '@/utils/generate-jwt-token';
import UserAuthService from '../user-auth.service';

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  ht_users: {
    findFirst: jest.fn(),
  },
  ht_counter_filter: {
    findUniqueOrThrow: jest.fn(),
    update: jest.fn(),
  },
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

jest.mock('@/utils/generate-jwt-token', () => ({
  generateJWTToken: jest.fn(),
}));

describe('UserAuthService', () => {
  let service: UserAuthService;
  const mockUser = {
    id: 1,
    hash_id: 'user_hash',
    name: 'John Doe',
    email: 'john@example.com',
    contact_no: '1234567890',
    username: 'john',
    password: 'hashedPassword',
    is_active: 1,
    created_at: new Date(),
    updated_at: new Date(),
    ht_company: {
      id: 1,
      hash_id: 'company_hash',
      company_name: 'Test Company',
    },
    ht_department: {
      hash_id: 'dept_hash',
      english_name: 'Dept',
      dept_hindi_name: 'Dept Hindi',
      dept_regional_name: 'Dept Regional',
    },
  };

  const mockCounter = {
    id: 10,
    hash_id: 'counter_hash',
    counter_name: 'Counter 1',
    is_logged_in: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserAuthService();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      (prisma.ht_users.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (
        prisma.ht_counter_filter.findUniqueOrThrow as jest.Mock
      ).mockResolvedValue(mockCounter);
      (prisma.ht_counter_filter.update as jest.Mock).mockResolvedValue({});
      (generateJWTToken as jest.Mock).mockReturnValue('jwt_token');

      const result = await service.login(
        { username: 'john', password: '1234', counter_id: 'counter_hash' },
        {
          id: 1,
          hash_id: '',
          company_name: '',
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
        }
      );

      expect(result.token).toBe('jwt_token');
      expect(result.user).toHaveProperty('name', 'John Doe');
      expect(prisma.ht_counter_filter.update).toHaveBeenCalledWith({
        where: { id: mockCounter.id, deleted_at: null },
        data: { is_logged_in: 1 },
      });
    });

    it('should throw error if user not found', async () => {
      (prisma.ht_users.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.login(
          { username: 'x', password: '1234', counter_id: 'counter_hash' },
          {
            id: 1,
            hash_id: '',
            company_name: '',
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
          }
        )
      ).rejects.toThrow(HttpBadRequestError);
    });

    it('should throw error if password invalid', async () => {
      (prisma.ht_users.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login(
          { username: 'john', password: 'wrong', counter_id: 'counter_hash' },
          {
            id: 1,
            hash_id: '',
            company_name: '',
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
          }
        )
      ).rejects.toThrow(HttpBadRequestError);
    });

    it('should throw error if counter is already logged in', async () => {
      (prisma.ht_users.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (
        prisma.ht_counter_filter.findUniqueOrThrow as jest.Mock
      ).mockResolvedValue({
        ...mockCounter,
        is_logged_in: 1,
      });

      await expect(
        service.login(
          { username: 'john', password: '1234', counter_id: 'counter_hash' },
          {
            id: 1,
            hash_id: '',
            company_name: '',
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
          }
        )
      ).rejects.toThrow(HttpBadRequestError);
    });

    it('should handle unexpected errors', async () => {
      (prisma.ht_users.findFirst as jest.Mock).mockRejectedValue(
        new Error('DB failure')
      );

      await expect(
        service.login(
          { username: 'john', password: '1234', counter_id: 'counter_hash' },
          {
            id: 1,
            hash_id: '',
            company_name: '',
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
          }
        )
      ).rejects.toThrow('DB failure');
    });
  });

  describe('getUserDetailsByHashId', () => {
    it('should return user details with counter', async () => {
      (prisma.ht_users.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (
        prisma.ht_counter_filter.findUniqueOrThrow as jest.Mock
      ).mockResolvedValue(mockCounter);

      const result = await service.getUserDetailsByHashId(
        'user_hash',
        'counter_hash'
      );
      expect(result.counter_details.hash_id).toBe('counter_hash');
    });

    it('should return null if user not found', async () => {
      (prisma.ht_users.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.getUserDetailsByHashId('user_hash');
      expect(result).toBeNull();
    });

    it('should handle unexpected error', async () => {
      (prisma.ht_users.findFirst as jest.Mock).mockRejectedValue(
        new Error('DB error')
      );

      await expect(service.getUserDetailsByHashId('user_hash')).rejects.toThrow(
        'DB error'
      );
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      (prisma.ht_counter_filter.update as jest.Mock).mockResolvedValue({});

      await service.logout({
        counter_details: { id: 10 },
      } as any);

      expect(prisma.ht_counter_filter.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { is_logged_in: 0 },
      });
    });

    it('should handle unexpected error during logout', async () => {
      (prisma.ht_counter_filter.update as jest.Mock).mockRejectedValue(
        new Error('DB error')
      );

      await expect(
        service.logout({ counter_details: { id: 10 } } as any)
      ).rejects.toThrow('DB error');
    });
  });
});
