import { DisplayTransferToken, TokenStatus } from '@prisma/client';
import { HttpNotFoundError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import {
  CompanyTokenManager,
  type ITokenData,
} from '@/utils/redis-token-manager';

interface SeriesInfo {
  id: number;
  hash_id: string;
  abbreviation: string;
}

interface SeriesStatistics {
  series_abbreviation: string;
  series_id: string;
  status_counts: Record<TokenStatus, number>;
  total: number;
}

interface StatusGroup {
  count: number;
  tokens: any[];
}

interface OverallTotals {
  WAITING: StatusGroup;
  PENDING: StatusGroup;
  HOLD: StatusGroup;
  COMPLETED: StatusGroup;
  TRANSFER: StatusGroup;
  ACTIVE: StatusGroup;
  total: number;
}

interface DateFilter {
  gte: Date;
  lte: Date;
}

interface CounterInfo {
  id: number;
  hash_id: string;
  series: string;
  transfer_token_wise: string | null;
  transfer_token_method: string | null;
  transfer_department_id: number | null;
  transfer_counter_id: number | null;
  dept_id?: number;
}

export default class TokenService {
  private static readonly TOKEN_STATUSES: TokenStatus[] =
    Object.values(TokenStatus);

  private static readonly DEFAULT_STATUS_COUNTS: Record<TokenStatus, number> = {
    WAITING: 0,
    PENDING: 0,
    HOLD: 0,
    COMPLETED: 0,
    TRANSFER: 0,
    ACTIVE: 0,
  };

  public async getTokenStatistics(
    companyHashId: string,
    counterHashId: string,
    dateFilter?: string
  ) {
    try {
      const [company, counter] = await Promise.all([
        prisma.ht_company.findUnique({
          where: {
            hash_id: companyHashId,
            deleted_at: null,
          },
          select: {
            id: true,
            hash_id: true,
          },
        }),
        prisma.ht_counter_filter.findUnique({
          where: {
            hash_id: counterHashId,
            deleted_at: null,
          },
          select: {
            id: true,
            hash_id: true,
            series: true,
            transfer_token_wise: true,
            transfer_token_method: true,
            transfer_department_id: true,
            transfer_counter_id: true,
            dept_id: true,
          },
        }),
      ]);

      if (!company) {
        throw new HttpNotFoundError('Company not found');
      }
      if (!counter) {
        throw new HttpNotFoundError('Counter not found');
      }

      const buttonSettings = await prisma.ht_company_settings.findFirst({
        where: {
          company_id: company.id,
          deleted_at: null,
        },
        select: {
          display_transfer_token: true,
        },
      });

      const seriesIds = this.parseSeriesIds(counter.series);

      const dateRange = this.buildDateFilter(dateFilter);

      const filteredTokens = await this.getFilteredTokens(
        company.hash_id,
        seriesIds,
        dateRange
      );

      // Apply transfer token filtering
      const transferFilteredTokens = this.applyTransferTokenFilter(
        filteredTokens,
        counter
      );

      const seriesInfo = await this.getSeriesInfo(seriesIds);

      const seriesStatistics = this.buildSeriesStatistics(
        seriesInfo,
        transferFilteredTokens
      );
      const overallTotals = this.buildOverallTotals(
        transferFilteredTokens,
        buttonSettings?.display_transfer_token ===
          DisplayTransferToken.WAITING_LIST
      );

      return this.formatResponse(
        seriesStatistics,
        overallTotals,
        company,
        counter,
        dateFilter
      );
    } catch (error) {
      console.error('Error in getTokenStatistics:', error);
      throw error;
    }
  }

  private applyTransferTokenFilter(
    tokens: ITokenData[],
    counter: CounterInfo
  ): ITokenData[] {
    return tokens.filter((token) => {
      // If token status is not TRANSFER, include it
      if (token.token_status === TokenStatus.TRANSFER) {
        // For TRANSFER tokens, apply filtering logic

        // if(counter.transfer_token_method === TransferTokenMethod.MANUAL) return counter.id === token

        // Check if current counter id equals transfer_counter_id
        const currentDepartmentId = counter.dept_id;
        return (
          counter.id === token.transfer_counter?.id ||
          currentDepartmentId === token.transfer_department?.id
        );
      }
      if (
        token.token_status === TokenStatus.PENDING ||
        token.token_status === TokenStatus.HOLD
      ) {
        return counter.id === token.counter?.id;
      }

      if (token.token_status === TokenStatus.COMPLETED) {
        return counter.id === token.counter?.id;
      }

      return true;
    });
  }

  private parseSeriesIds(seriesString: string): number[] {
    try {
      const seriesIds = seriesString
        .split(',')
        .map((id) => {
          const parsed = Number(id.trim());
          if (isNaN(parsed) || parsed <= 0) {
            throw new Error(`Invalid series ID: ${id}`);
          }
          return parsed;
        })
        .filter(Boolean);

      if (seriesIds.length === 0) {
        throw new Error('No valid series IDs found');
      }

      return seriesIds;
    } catch (error) {
      throw new Error(`Failed to parse series IDs: ${error.message as string}`);
    }
  }

  private buildDateFilter(dateFilter?: string): DateFilter {
    const targetDate = dateFilter ? new Date(dateFilter) : new Date();

    if (isNaN(targetDate.getTime())) {
      throw new Error('Invalid date filter provided');
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    return {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  private async getFilteredTokens(
    companyHashId: string,
    seriesIds: number[],
    dateRange: DateFilter
  ): Promise<ITokenData[]> {
    const tokenManager = new CompanyTokenManager(companyHashId);
    const allTokens = await tokenManager.getTokens();

    return allTokens.filter(
      (token) =>
        seriesIds.includes(token.series.id) &&
        this.isDateInRange(token.token_date, dateRange)
    );
  }

  private isDateInRange(tokenDate: Date, dateRange: DateFilter): boolean {
    const tokenTime = tokenDate.getTime();
    return (
      tokenTime >= dateRange.gte.getTime() &&
      tokenTime <= dateRange.lte.getTime()
    );
  }

  private async getSeriesInfo(seriesIds: number[]): Promise<SeriesInfo[]> {
    const seriesInfo = await prisma.ht_series.findMany({
      where: {
        id: {
          in: seriesIds,
        },
        deleted_at: null,
      },
      select: {
        id: true,
        hash_id: true,
        abbreviation: true,
      },
    });

    if (seriesInfo.length === 0) {
      throw new HttpNotFoundError('No series found for the provided IDs');
    }

    return seriesInfo;
  }

  private buildSeriesStatistics(
    seriesInfo: SeriesInfo[],
    tokens: ITokenData[]
  ): SeriesStatistics[] {
    const seriesMap = new Map<number, SeriesStatistics>();

    seriesInfo.forEach((series) => {
      seriesMap.set(series.id, {
        series_abbreviation: series.abbreviation,
        series_id: series.hash_id,
        status_counts: { ...TokenService.DEFAULT_STATUS_COUNTS },
        total: 0,
      });
    });

    tokens.forEach((token) => {
      const seriesData = seriesMap.get(token.series.id);
      if (seriesData && token.token_status in seriesData.status_counts) {
        seriesData.status_counts[token.token_status]++;
        seriesData.total++;
      }
    });

    return Array.from(seriesMap.values());
  }

  private buildOverallTotals(
    tokens: ITokenData[],
    treatTransferAsWaiting: boolean
  ): OverallTotals {
    const overallTotals: OverallTotals = {
      WAITING: { count: 0, tokens: [] },
      PENDING: { count: 0, tokens: [] },
      HOLD: { count: 0, tokens: [] },
      COMPLETED: { count: 0, tokens: [] },
      TRANSFER: { count: 0, tokens: [] },
      ACTIVE: { count: 0, tokens: [] },
      total: 0,
    };

    tokens.forEach((token) => {
      let status = token.token_status;

      if (status === TokenStatus.TRANSFER && treatTransferAsWaiting) {
        status = TokenStatus.WAITING;
      }

      if (status in overallTotals) {
        overallTotals[status].count++;
        // Transform token structure to flatten nested objects
        const transformedToken = this.transformTokenResponse(token);
        overallTotals[status].tokens.push(transformedToken);
        overallTotals.total++;
      }
    });

    TokenService.TOKEN_STATUSES.forEach((status) => {
      if (overallTotals[status]?.tokens) {
        overallTotals[status].tokens.sort(this.compareTokens);
      }
    });

    return overallTotals;
  }

  private readonly compareTokens = (a: any, b: any): number => {
    // Sort by priority (higher priority first)
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }

    // Then by generation time (earlier first)
    return (
      new Date(a.token_generate_time).getTime() -
      new Date(b.token_generate_time).getTime()
    );
  };

  private transformTokenResponse(token: ITokenData): any {
    return {
      token_id: token.token_id,
      token_abbreviation: token.token_abbreviation,
      series_id: token.series?.hash_id || null,
      token_number: token.token_number,
      token_date: token.token_date,
      priority: token.priority,
      token_status: token.token_status,
      token_series_number: token.token_series_number,
      token_calling_time: token.token_calling_time,
      token_out_time: token.token_out_time,
      customer_name: token.customer_name,
      customer_mobile_number: token.customer_mobile_number,
      token_generate_time: token.token_generate_time,
      transfer_counter_id: token.transfer_counter?.hash_id || null,
      transfer_department_id: token.transfer_department?.hash_id || null,
    };
  }

  private formatResponse(
    seriesData: SeriesStatistics[],
    overallTotals: OverallTotals,
    company: { id: number; hash_id: string },
    counter: CounterInfo,
    dateFilter?: string
  ) {
    return {
      series_data: seriesData,
      overall_totals: overallTotals,
      company_info: {
        company_hash_id: company.hash_id, // Changed from company_id to company_hash_id
      },
      counter_info: {
        counter_hash_id: counter.hash_id, // Changed from counter_id to counter_hash_id
      },
    };
  }
}
