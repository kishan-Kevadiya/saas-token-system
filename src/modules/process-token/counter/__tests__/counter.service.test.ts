import prisma from '@/lib/prisma';
import CounterService from '../counter.service';
import { UserResponseDto } from '../../user-auth/dto/current-user-auth.dto';

jest.mock('@/lib/prisma', () => ({
  ht_counter_filter: {
    findMany: jest.fn(),
  },
}));

describe('CounterService', () => {
  let service: CounterService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CounterService();
  });

  describe('getCounterByCompanyId', () => {
    it('should return counter list successfully', async () => {
      (prisma.ht_counter_filter.findMany as jest.Mock).mockResolvedValue([
        {
          hash_id: 'hash1',
          counter_no: 1,
          counter_name: 'Counter 1',
          transfer_token_wise: true,
          transfer_token_method: 'AUTO',
          transfer_token_next_click: false,
        },
      ]);

      const currentUser = { id: 'company123' };
      const result = await service.getCounterByCompanyId(currentUser);

      expect(prisma.ht_counter_filter.findMany).toHaveBeenCalledWith({
        where: { company_id: 'company123', deleted_at: null },
        select: {
          hash_id: true,
          counter_no: true,
          counter_name: true,
          transfer_token_wise: true,
          transfer_token_method: true,
          transfer_token_next_click: true,
        },
      });

      expect(result).toEqual({
        counter: [
          {
            id: 'hash1',
            counter_no: 1,
            counter_name: 'Counter 1',
            transfer_token_wise: true,
            transfer_token_method: 'AUTO',
            transfer_token_next_click: false,
          },
        ],
      });
    });

    it('should throw unexpected error', async () => {
      (prisma.ht_counter_filter.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        service.getCounterByCompanyId({ id: 'company123' })
      ).rejects.toThrow('Database error');
    });
  });

  describe('counterListForDropDown', () => {
    it('should return counter dropdown list for logged in counters', async () => {
      (prisma.ht_counter_filter.findMany as jest.Mock).mockResolvedValue([
        { hash_id: 'hash1', counter_name: 'Counter 1', counter_no: 1 },
      ]);

      const currentUser = {
        company: { id: 'company456' },
      } as unknown as UserResponseDto;

      const result = await service.counterListForDropDown(currentUser);

      expect(prisma.ht_counter_filter.findMany).toHaveBeenCalledWith({
        where: { company_id: 'company456', is_logged_in: 1 },
        select: {
          hash_id: true,
          counter_name: true,
          counter_no: true,
        },
      });

      expect(result).toEqual([
        {
          id: 'hash1',
          counter_name: 'Counter 1',
          counter_no: 1,
        },
      ]);
    });

    it('should throw unexpected error', async () => {
      (prisma.ht_counter_filter.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        service.counterListForDropDown({
          company: { id: 'company456' },
        } as unknown as UserResponseDto)
      ).rejects.toThrow('Database error');
    });
  });
});
