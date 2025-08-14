// token.service.test.ts
import TokenService from '../token.service';
import { TokenStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { CompanyTokenManager } from '@/utils/redis-token-manager';

jest.mock('@/lib/prisma', () => ({
  ht_company: { findUnique: jest.fn() },
  ht_counter_filter: { findUnique: jest.fn() },
  ht_company_settings: { findFirst: jest.fn() },
  ht_series: { findMany: jest.fn() },
}));

jest.mock('@/utils/redis-token-manager', () => ({
  CompanyTokenManager: jest.fn().mockImplementation(() => ({
    getTokens: jest.fn(),
  })),
}));

describe('TokenService', () => {
  let service: TokenService;
  let mockTokenManager: jest.Mocked<CompanyTokenManager>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TokenService();
    mockTokenManager = new CompanyTokenManager(
      'company_id',
      'counter_id'
    ) as jest.Mocked<CompanyTokenManager>;
    (service as any).tokenManager = mockTokenManager;
  });

  describe('parseSeriesIds', () => {
    it('should parse valid IDs', () => {
      const result = (service as any).parseSeriesIds('1,2,3');
      expect(result).toEqual([1, 2, 3]);
    });

    it('should throw if no valid IDs', () => {
      expect(() => (service as any).parseSeriesIds('')).toThrow(
        'Failed to parse series IDs: Invalid series ID: '
      );
    });

    it('should throw on non-numeric ID', () => {
      expect(() => (service as any).parseSeriesIds('1,abc')).toThrow(
        'Failed to parse series IDs: Invalid series ID: abc'
      );
    });
  });

  describe('buildDateFilter', () => {
    it('should build correct date range for given date', () => {
      const result = service['buildDateFilter']('2023-05-01');
      expect(result.gte.getHours()).toBe(0);
      expect(result.lte.getHours()).toBe(23);
    });

    it('should throw for invalid date', () => {
      expect(() => service['buildDateFilter']('invalid')).toThrow(
        'Invalid date filter provided'
      );
    });
  });

  describe('isDateInRange', () => {
    const range = {
      gte: new Date('2023-01-01T00:00:00Z'),
      lte: new Date('2023-01-01T23:59:59Z'),
    };

    it('should return true if date is in range', () => {
      expect(
        service['isDateInRange'](new Date('2023-01-01T12:00:00Z'), range)
      ).toBe(true);
    });

    it('should return false if before range', () => {
      expect(
        service['isDateInRange'](new Date('2022-12-31T23:59:59Z'), range)
      ).toBe(false);
    });

    it('should return false if after range', () => {
      expect(
        service['isDateInRange'](new Date('2023-01-02T00:00:00Z'), range)
      ).toBe(false);
    });
  });

  describe('applyTransferTokenFilter', () => {
    const counter = { id: 1, dept_id: 10 } as any;

    it('should include non-TRANSFER tokens', () => {
      const tokens = [{ token_status: TokenStatus.WAITING }] as any;
      expect(service['applyTransferTokenFilter'](tokens, counter)).toEqual(
        tokens
      );
    });

    it('should include TRANSFER token if matches counter id', () => {
      const tokens = [
        { token_status: TokenStatus.TRANSFER, transfer_counter: { id: 1 } },
      ] as any;
      expect(service['applyTransferTokenFilter'](tokens, counter)).toHaveLength(
        1
      );
    });

    it('should include PENDING token if matches counter id', () => {
      const tokens = [
        { token_status: TokenStatus.PENDING, counter: { id: 1 } },
      ] as any;
      expect(service['applyTransferTokenFilter'](tokens, counter)).toHaveLength(
        1
      );
    });
  });

  describe('buildSeriesStatistics', () => {
    it('should count token statuses per series', () => {
      const result = service['buildSeriesStatistics'](
        [{ id: 1, abbreviation: 'A', hash_id: 's1' }] as any,
        [{ series: { id: 1 }, token_status: TokenStatus.WAITING }] as any
      );
      expect(result[0].status_counts.WAITING).toBe(1);
    });
  });

  describe('buildOverallTotals', () => {
    it('should count tokens per status', () => {
      const result = service['buildOverallTotals'](
        [
          {
            token_status: TokenStatus.WAITING,
            priority: 1,
            token_generate_time: new Date(),
          },
        ] as any,
        false
      );
      expect(result.WAITING.count).toBe(1);
      expect(result.total).toBe(1);
    });

    it('should treat TRANSFER as WAITING when flag set', () => {
      const result = service['buildOverallTotals'](
        [
          {
            token_status: TokenStatus.TRANSFER,
            priority: 1,
            token_generate_time: new Date(),
          },
        ] as any,
        true
      );
      expect(result.WAITING.count).toBe(1);
    });
  });

  describe('transformTokenResponse', () => {
    it('should flatten nested objects', () => {
      const result = service['transformTokenResponse']({
        token_id: 1,
        token_abbreviation: 'T1',
        series: { hash_id: 's1' },
        transfer_counter: { hash_id: 'c1' },
        transfer_department: { hash_id: 'd1' },
      } as any);
      expect(result.series_id).toBe('s1');
      expect(result.transfer_counter_id).toBe('c1');
    });
  });
});
