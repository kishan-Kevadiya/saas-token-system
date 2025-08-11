import { TokenStatus } from '@prisma/client';
import type { Redis } from 'ioredis';
import RedisClient from '@/lib/redis.client';
import prisma from '@/lib/prisma';
import moment from 'moment';

interface ISeries {
  id: number,
  hash_id: string,
}

interface ICounter {
  id: number,
  hash_id: string,
  counter_no: number,

}

interface IUser {
  id: number,
  hash_id: string,
  name: string
}

interface ILanguage {
  id: number,
  hash_id: string,
  name: string
  code: string
}

interface IComapny {
  id: Number,
  hash_id: string,
  name: string,

}

interface IDepartment {
  id: Number,
  hash_id: string,
  name: string,
}


export interface ITokenData {
  token_id: string;
  token_abbreviation: string;
  series: ISeries;
  token_number: number;
  token_date: Date;
  priority: number;
  token_status: TokenStatus;
  counter?: ICounter | null;
  user?: IUser;
  token_series_number: string;
  token_calling_time: Date | null;
  token_out_time: Date | null;
  language: ILanguage;
  company: IComapny;
  transfer_counter?: ICounter | null;
  transfer_department?: IDepartment | null;
  customer_name?: string | null;
  customer_mobile_number?: string | null;
  token_generate_time: Date;
  form_data?: string
  time_taken: string
  hold_out_time?: Date | null;
  hold_in_time?: Date | null;
}



class RedisTokenStore {
  private readonly redis: Redis;
  private readonly keyPrefix: string;

  constructor(companyId: string) {
    this.redis = RedisClient.getInstance();
    this.keyPrefix = `company:${companyId}:tokens`;
  }

  async getTokenById(tokenId: string): Promise<ITokenData> {
    try {
      const tokenKey = `${this.keyPrefix}:${tokenId}`;
      const existingData = await this.redis.get(tokenKey);

      if (!existingData) {
        throw new Error(`Token ${tokenId} not found`);
      }

      const currentToken: ITokenData = JSON.parse(existingData);

      return {
        ...currentToken,
      };
    } catch (error) {
      console.error('Error reading token from Redis:', error);
      throw new Error('Failed to read token from Redis');
    }
  }

  async addToken(token: ITokenData): Promise<void> {
    try {
      const tokenKey = `${this.keyPrefix}:${token.token_id}`;
      const tokenData = JSON.stringify({
        ...token,
        token_date: token.token_date.toISOString(),
        token_calling_time: token.token_calling_time?.toISOString() ?? null,
        token_out_time: token.token_out_time?.toISOString() ?? null,
        token_generate_time: token.token_generate_time.toISOString(),
      });

      // Store individual token
      await this.redis.setex(tokenKey, 86400, tokenData); // 24 hours TTL

      // Add to company tokens set for quick retrieval
      await this.redis.sadd(`${this.keyPrefix}:set`, token.token_id);

      // Set expiry for the set as well
      await this.redis.expire(`${this.keyPrefix}:set`, 86400);

      // Add to status-based sets for efficient filtering
      await this.redis.sadd(
        `${this.keyPrefix}:status:${token.token_status}`,
        token.token_id
      );
      await this.redis.expire(
        `${this.keyPrefix}:status:${token.token_status}`,
        86400
      );

      // Add to series-based sets
      await this.redis.sadd(
        `${this.keyPrefix}:series:${token.series.hash_id}`,
        token.token_id
      );
      await this.redis.expire(
        `${this.keyPrefix}:series:${token.series.hash_id}`,
        86400
      );
    } catch (error) {
      console.error('Error adding token to Redis:', error);
      throw new Error('Failed to add token to Redis');
    }
  }

  async getTokens(): Promise<ITokenData[]> {
    try {
      const tokenIds = await this.redis.smembers(`${this.keyPrefix}:set`);

      if (tokenIds.length === 0) {
        return [];
      }

      const pipeline = this.redis.pipeline();
      tokenIds.forEach((tokenId) => {
        pipeline.get(`${this.keyPrefix}:${tokenId}`);
      });

      const results = await pipeline.exec();
      const tokens: ITokenData[] = [];

      results?.forEach((result, index) => {
        if (result[1]) {
          try {
            const tokenData = JSON.parse(result[1] as string);
            tokens.push({
              ...tokenData,
              token_date: new Date(tokenData.token_date),
              token_calling_time: tokenData.token_calling_time
                ? new Date(tokenData.token_calling_time)
                : null,
              token_out_time: tokenData.token_out_time
                ? new Date(tokenData.token_out_time)
                : null,
              token_generate_time: new Date(tokenData.token_generate_time),
            });
          } catch (parseError) {
            console.error(
              `Error parsing token data for ID ${tokenIds[index]}:`,
              parseError
            );
          }
        }
      });

      return tokens;
    } catch (error) {
      console.error('Error getting tokens from Redis:', error);
      throw new Error('Failed to get tokens from Redis');
    }
  }

  async getTokensByStatus(status: TokenStatus): Promise<ITokenData[]> {
    try {
      const tokenIds = await this.redis.smembers(
        `${this.keyPrefix}:status:${status}`
      );

      if (tokenIds.length === 0) {
        return [];
      }

      const pipeline = this.redis.pipeline();
      tokenIds.forEach((tokenId) => {
        pipeline.get(`${this.keyPrefix}:${tokenId}`);
      });

      const results = await pipeline.exec();
      const tokens: ITokenData[] = [];

      results?.forEach((result, index) => {
        if (result[1]) {
          try {
            const tokenData = JSON.parse(result[1] as string);
            tokens.push({
              ...tokenData,
              token_date: new Date(tokenData.token_date),
              token_calling_time: tokenData.token_calling_time
                ? new Date(tokenData.token_calling_time)
                : null,
              token_out_time: tokenData.token_out_time
                ? new Date(tokenData.token_out_time)
                : null,
              token_generate_time: new Date(tokenData.token_generate_time),
            });
          } catch (parseError) {
            console.error(
              `Error parsing token data for ID ${tokenIds[index]}:`,
              parseError
            );
          }
        }
      });

      return tokens;
    } catch (error) {
      console.error('Error getting tokens by status from Redis:', error);
      throw new Error('Failed to get tokens by status from Redis');
    }
  }

  async getTokensBySeries(seriesId: number): Promise<ITokenData[]> {
    try {
      const tokenIds = await this.redis.smembers(
        `${this.keyPrefix}:series:${seriesId}`
      );

      if (tokenIds.length === 0) {
        return [];
      }

      const pipeline = this.redis.pipeline();
      tokenIds.forEach((tokenId) => {
        pipeline.get(`${this.keyPrefix}:${tokenId}`);
      });

      const results = await pipeline.exec();
      const tokens: ITokenData[] = [];

      results?.forEach((result, index) => {
        if (result[1]) {
          try {
            const tokenData = JSON.parse(result[1] as string);
            tokens.push({
              ...tokenData,
              token_date: new Date(tokenData.token_date),
              token_calling_time: tokenData.token_calling_time
                ? new Date(tokenData.token_calling_time)
                : null,
              token_out_time: tokenData.token_out_time
                ? new Date(tokenData.token_out_time)
                : null,
              token_generate_time: new Date(tokenData.token_generate_time),
            });
          } catch (parseError) {
            console.error(
              `Error parsing token data for ID ${tokenIds[index]}:`,
              parseError
            );
          }
        }
      });

      return tokens;
    } catch (error) {
      console.error('Error getting tokens by series from Redis:', error);
      throw new Error('Failed to get tokens by series from Redis');
    }
  }

  async updateToken(
    tokenId: string,
    updates: Partial<ITokenData>
  ): Promise<void> {
    try {
      const tokenKey = `${this.keyPrefix}:${tokenId}`;
      const existingData = await this.redis.get(tokenKey);

      if (!existingData) {
        throw new Error(`Token ${tokenId} not found`);
      }

      const currentToken = JSON.parse(existingData);
      const updatedToken = {
        ...currentToken,
        ...updates,
        token_date:
          updates.token_date?.toISOString() ?? currentToken.token_date,
        token_calling_time:
          updates.token_calling_time?.toISOString() ??
          currentToken.token_calling_time,
        token_out_time:
          updates.token_out_time?.toISOString() ?? currentToken.token_out_time,
        token_generate_time:
          updates.token_generate_time?.toISOString() ??
          currentToken.token_generate_time,
      };

      await this.redis.setex(tokenKey, 86400, JSON.stringify(updatedToken));

      // Update status-based sets if status changed
      if (
        updates.token_status &&
        updates.token_status !== currentToken.token_status
      ) {
        await this.redis.srem(
          `${this.keyPrefix}:status:${currentToken.token_status as string}`,
          tokenId
        );
        await this.redis.sadd(
          `${this.keyPrefix}:status:${updates.token_status}`,
          tokenId
        );
        await this.redis.expire(
          `${this.keyPrefix}:status:${updates.token_status}`,
          86400
        );
      }
    } catch (error) {
      console.error('Error updating token in Redis:', error);
      throw new Error('Failed to update token in Redis');
    }
  }

  async removeToken(tokenId: string): Promise<void> {
    try {
      const tokenKey = `${this.keyPrefix}:${tokenId}`;
      const tokenData = await this.redis.get(tokenKey);

      if (tokenData) {
        const token = JSON.parse(tokenData);

        // Remove from all sets
        await this.redis.srem(`${this.keyPrefix}:set`, tokenId);
        await this.redis.srem(
          `${this.keyPrefix}:status:${token.token_status as string}`,
          tokenId
        );
        await this.redis.srem(
          `${this.keyPrefix}:series:${token.series_id as string}`,
          tokenId
        );

        // Remove the token itself
        await this.redis.del(tokenKey);
      }
    } catch (error) {
      console.error('Error removing token from Redis:', error);
      throw new Error('Failed to remove token from Redis');
    }
  }

  async clearTokens(): Promise<void> {
    try {
      const tokenIds = await this.redis.smembers(`${this.keyPrefix}:set`);

      if (tokenIds.length > 0) {
        const pipeline = this.redis.pipeline();

        // Delete all individual tokens
        tokenIds.forEach((tokenId) => {
          pipeline.del(`${this.keyPrefix}:${tokenId}`);
        });

        // Clear all sets
        pipeline.del(`${this.keyPrefix}:set`);

        // Clear status sets
        const statusKeys = await this.redis.keys(`${this.keyPrefix}:status:*`);
        statusKeys.forEach((key) => pipeline.del(key));

        // Clear series sets
        const seriesKeys = await this.redis.keys(`${this.keyPrefix}:series:*`);
        seriesKeys.forEach((key) => pipeline.del(key));

        await pipeline.exec();
      }
    } catch (error) {
      console.error('Error clearing tokens from Redis:', error);
      throw new Error('Failed to clear tokens from Redis');
    }
  }

  async isEmpty(): Promise<boolean> {
    try {
      const count = await this.redis.scard(`${this.keyPrefix}:set`);
      return count === 0;
    } catch (error) {
      console.error('Error checking if tokens are empty in Redis:', error);
      return true;
    }
  }

  async count(): Promise<number> {
    try {
      return await this.redis.scard(`${this.keyPrefix}:set`);
    } catch (error) {
      console.error('Error counting tokens in Redis:', error);
      return 0;
    }
  }

  async getTokenStatisticsByStatus(): Promise<Record<string, number>> {
    try {
      const statuses = [
        'PENDING',
        'HOLD',
        'ACTIVE',
        'TRANSFER',
        'WAITING',
        'COMPLETED',
      ];
      const pipeline = this.redis.pipeline();

      statuses.forEach((status) => {
        pipeline.scard(`${this.keyPrefix}:status:${status}`);
      });

      const results = await pipeline.exec();
      const statistics: Record<string, number> = {};

      statuses.forEach((status, index) => {
        statistics[status] = results?.[index]?.[1] as number;
      });

      return statistics;
    } catch (error) {
      console.error('Error getting token statistics from Redis:', error);
      return {
        WAITING: 0,
        PENDING: 0,
        TRANSFER: 0,
        ACTIVE: 0,
        COMPLETED: 0,
        HOLD: 0,
      };
    }
  }
}

export class CompanyTokenManager {
  private static readonly instances = new Map<string, RedisTokenStore>();
  private readonly store: RedisTokenStore;
  private param: Record<string, any>;

  constructor(companyId: string, counterId?: string) {
    this.param = {
      company_id: companyId,
      counter_id: counterId
    };

    if (!CompanyTokenManager.instances.has(this.param.company_id)) {
      CompanyTokenManager.instances.set(
        this.param.company_id,
        new RedisTokenStore(this.param.company_id)
      );
    }

    this.store = CompanyTokenManager.instances.get(this.param.company_id)!;
  }


  private readonly compareTokens = (a: ITokenData, b: ITokenData): number => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }

    return a.token_generate_time.getTime() - b.token_generate_time.getTime();
  };

  async addToken(token: ITokenData): Promise<void> {
    await this.store.addToken(token);
  }

  async getTokenById(tokenId: string): Promise<ITokenData> {
    return await this.store.getTokenById(tokenId);
  }


  async getTokens(): Promise<ITokenData[]> {
    return await this.store.getTokens();
  }

  async getTokensByStatus(status: TokenStatus): Promise<ITokenData[]> {
    return await this.store.getTokensByStatus(status);
  }

  async getTokensBySeries(seriesId: number): Promise<ITokenData[]> {
    return await this.store.getTokensBySeries(seriesId);
  }

  async updateToken(
    tokenId: string,
    updates: Partial<ITokenData>
  ): Promise<void> {
    await this.store.updateToken(tokenId, updates);
  }

  async removeToken(tokenId: string): Promise<void> {
    await this.store.removeToken(tokenId);
  }

  async clearTokens(): Promise<void> {
    await this.store.clearTokens();
  }

  async isEmpty(): Promise<boolean> {
    return await this.store.isEmpty();
  }

  async count(): Promise<number> {
    return await this.store.count();
  }

  async getTokenStatisticsByStatus(): Promise<Record<string, number>> {
    return await this.store.getTokenStatisticsByStatus();
  }

  static getAllCompanyIds(): string[] {
    return Array.from(CompanyTokenManager.instances.keys());
  }

  static getStore(companyId: string): RedisTokenStore | undefined {
    return CompanyTokenManager.instances.get(companyId);
  }

  static async clearCompany(companyId: string): Promise<void> {
    const store = CompanyTokenManager.instances.get(companyId);
    if (store) {
      await store.clearTokens();
      CompanyTokenManager.instances.delete(companyId);
    }
  }

  static async clearAll(): Promise<void> {
    const promises = Array.from(CompanyTokenManager.instances.entries()).map(
      async ([companyId, store]) => {
        await store.clearTokens();
      }
    );

    await Promise.all(promises);
    CompanyTokenManager.instances.clear();
  }

  static async getGlobalStatistics(): Promise<Record<string, any>> {
    const globalStats: Record<string, any> = {};

    const promises = Array.from(CompanyTokenManager.instances.entries()).map(
      async ([companyId, store]) => {
        const manager = new CompanyTokenManager(companyId);
        globalStats[companyId] = {
          total_tokens: await manager.count(),
          status_breakdown: await manager.getTokenStatisticsByStatus(),
        };
      }
    );

    await Promise.all(promises);
    return globalStats;
  }


  async priorityTokens(filterSeriesId?: string): Promise<ITokenData[]> {
    const seriesOfCounter = await prisma.ht_counter_filter.findUniqueOrThrow({
      where: {
        hash_id: this.param.counter_id,
        deleted_at: null,
      },
      select: {
        series: true
      }
    });

    const seriesListOfCounter = seriesOfCounter.series.split(",").map(Number);

    const seriesList = await prisma.ht_series.findMany({
      where: {
        id: {
          in: seriesListOfCounter
        },
        company: {
          hash_id: this.param.company_id
        },
        deleted_at: null
      },
      select: {
        abbreviation: true,
        priority: true
      }
    });

    const allowedAbbreviations = seriesList.map(s => s.abbreviation);

    const tokenListData = await this.getTokens();
    const filteredTokens = tokenListData.filter(token =>
      token.company.hash_id === this.param.company_id &&
      ( filterSeriesId ? filterSeriesId === token.series.hash_id : allowedAbbreviations.includes(token.token_abbreviation)) &&
      
      allowedAbbreviations.includes(token.token_abbreviation) &&
      moment(token.token_date).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD') &&
      token.token_status === TokenStatus.WAITING
    );


    filteredTokens.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return new Date(a.token_generate_time).getTime() - new Date(b.token_generate_time).getTime();
    });

    const topTwo = filteredTokens.slice(0, 2);

    return topTwo;
  }

}
