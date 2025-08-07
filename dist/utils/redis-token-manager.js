"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyTokenManager = void 0;
const redis_client_1 = __importDefault(require("../lib/redis.client"));
const prisma_1 = __importDefault(require("../lib/prisma"));
class RedisTokenStore {
    redis;
    keyPrefix;
    constructor(companyId) {
        this.redis = redis_client_1.default.getInstance();
        this.keyPrefix = `company:${companyId}:tokens`;
    }
    async addToken(token) {
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
            await this.redis.sadd(`${this.keyPrefix}:status:${token.token_status}`, token.token_id);
            await this.redis.expire(`${this.keyPrefix}:status:${token.token_status}`, 86400);
            // Add to series-based sets
            await this.redis.sadd(`${this.keyPrefix}:series:${token.series.hash_id}`, token.token_id);
            await this.redis.expire(`${this.keyPrefix}:series:${token.series.hash_id}`, 86400);
        }
        catch (error) {
            console.error('Error adding token to Redis:', error);
            throw new Error('Failed to add token to Redis');
        }
    }
    async getTokens() {
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
            const tokens = [];
            results?.forEach((result, index) => {
                if (result[1]) {
                    try {
                        const tokenData = JSON.parse(result[1]);
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
                    }
                    catch (parseError) {
                        console.error(`Error parsing token data for ID ${tokenIds[index]}:`, parseError);
                    }
                }
            });
            return tokens;
        }
        catch (error) {
            console.error('Error getting tokens from Redis:', error);
            throw new Error('Failed to get tokens from Redis');
        }
    }
    async getTokensByStatus(status) {
        try {
            const tokenIds = await this.redis.smembers(`${this.keyPrefix}:status:${status}`);
            if (tokenIds.length === 0) {
                return [];
            }
            const pipeline = this.redis.pipeline();
            tokenIds.forEach((tokenId) => {
                pipeline.get(`${this.keyPrefix}:${tokenId}`);
            });
            const results = await pipeline.exec();
            const tokens = [];
            results?.forEach((result, index) => {
                if (result[1]) {
                    try {
                        const tokenData = JSON.parse(result[1]);
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
                    }
                    catch (parseError) {
                        console.error(`Error parsing token data for ID ${tokenIds[index]}:`, parseError);
                    }
                }
            });
            return tokens;
        }
        catch (error) {
            console.error('Error getting tokens by status from Redis:', error);
            throw new Error('Failed to get tokens by status from Redis');
        }
    }
    async getTokensBySeries(seriesId) {
        try {
            const tokenIds = await this.redis.smembers(`${this.keyPrefix}:series:${seriesId}`);
            if (tokenIds.length === 0) {
                return [];
            }
            const pipeline = this.redis.pipeline();
            tokenIds.forEach((tokenId) => {
                pipeline.get(`${this.keyPrefix}:${tokenId}`);
            });
            const results = await pipeline.exec();
            const tokens = [];
            results?.forEach((result, index) => {
                if (result[1]) {
                    try {
                        const tokenData = JSON.parse(result[1]);
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
                    }
                    catch (parseError) {
                        console.error(`Error parsing token data for ID ${tokenIds[index]}:`, parseError);
                    }
                }
            });
            return tokens;
        }
        catch (error) {
            console.error('Error getting tokens by series from Redis:', error);
            throw new Error('Failed to get tokens by series from Redis');
        }
    }
    async updateToken(tokenId, updates) {
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
                token_date: updates.token_date?.toISOString() ?? currentToken.token_date,
                token_calling_time: updates.token_calling_time?.toISOString() ??
                    currentToken.token_calling_time,
                token_out_time: updates.token_out_time?.toISOString() ?? currentToken.token_out_time,
                token_generate_time: updates.token_generate_time?.toISOString() ??
                    currentToken.token_generate_time,
            };
            await this.redis.setex(tokenKey, 86400, JSON.stringify(updatedToken));
            // Update status-based sets if status changed
            if (updates.token_status &&
                updates.token_status !== currentToken.token_status) {
                await this.redis.srem(`${this.keyPrefix}:status:${currentToken.token_status}`, tokenId);
                await this.redis.sadd(`${this.keyPrefix}:status:${updates.token_status}`, tokenId);
                await this.redis.expire(`${this.keyPrefix}:status:${updates.token_status}`, 86400);
            }
        }
        catch (error) {
            console.error('Error updating token in Redis:', error);
            throw new Error('Failed to update token in Redis');
        }
    }
    async removeToken(tokenId) {
        try {
            const tokenKey = `${this.keyPrefix}:${tokenId}`;
            const tokenData = await this.redis.get(tokenKey);
            if (tokenData) {
                const token = JSON.parse(tokenData);
                // Remove from all sets
                await this.redis.srem(`${this.keyPrefix}:set`, tokenId);
                await this.redis.srem(`${this.keyPrefix}:status:${token.token_status}`, tokenId);
                await this.redis.srem(`${this.keyPrefix}:series:${token.series_id}`, tokenId);
                // Remove the token itself
                await this.redis.del(tokenKey);
            }
        }
        catch (error) {
            console.error('Error removing token from Redis:', error);
            throw new Error('Failed to remove token from Redis');
        }
    }
    async clearTokens() {
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
        }
        catch (error) {
            console.error('Error clearing tokens from Redis:', error);
            throw new Error('Failed to clear tokens from Redis');
        }
    }
    async isEmpty() {
        try {
            const count = await this.redis.scard(`${this.keyPrefix}:set`);
            return count === 0;
        }
        catch (error) {
            console.error('Error checking if tokens are empty in Redis:', error);
            return true;
        }
    }
    async count() {
        try {
            return await this.redis.scard(`${this.keyPrefix}:set`);
        }
        catch (error) {
            console.error('Error counting tokens in Redis:', error);
            return 0;
        }
    }
    async getTokenStatisticsByStatus() {
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
            const statistics = {};
            statuses.forEach((status, index) => {
                statistics[status] = results?.[index]?.[1];
            });
            return statistics;
        }
        catch (error) {
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
// export class CompanyTokenManager {
//   private static readonly instances = new Map<string, RedisTokenStore>();
//   private readonly store: RedisTokenStore;
//   private param: Record<string, any>;
//   constructor(companyId: string, counterId?: string) {
//     this.param = {
//       company_id: companyId,
//       counter_id: counterId
//     };
//     if (!CompanyTokenManager.instances.has(this.param.company_id)) {
//       CompanyTokenManager.instances.set(
//         this.param.company_id,
//         new RedisTokenStore(this.param.company_id)
//       );
//     }
//     this.store = CompanyTokenManager.instances.get(this.param.companyId) as any;
//   }
//   async addToken(token: ITokenData): Promise<void> {
//     // await this.store.addToken(token);
//     await this.addToken(token)
//   }
//   async getTokens(): Promise<ITokenData[]> {
//     return await this.getTokens();
//   }
//   async getTokensByStatus(status: TokenStatus): Promise<ITokenData[]> {
//     return await this.store.getTokensByStatus(status);
//   }
//   async getTokensBySeries(seriesId: number): Promise<ITokenData[]> {
//     return await this.store.getTokensBySeries(seriesId);
//   }
//   async updateToken(
//     tokenId: string,
//     updates: Partial<ITokenData>
//   ): Promise<void> {
//     await this.store.updateToken(tokenId, updates);
//   }
//   async removeToken(tokenId: string): Promise<void> {
//     await this.store.removeToken(tokenId);
//   }
//   async clearTokens(): Promise<void> {
//     await this.store.clearTokens();
//   }
//   async isEmpty(): Promise<boolean> {
//     return await this.store.isEmpty();
//   }
//   async count(): Promise<number> {
//     return await this.store.count();
//   }
//   async getTokenStatisticsByStatus(): Promise<Record<string, number>> {
//     return await this.store.getTokenStatisticsByStatus();
//   }
//   static getAllCompanyIds(): string[] {
//     return Array.from(CompanyTokenManager.instances.keys());
//   }
//   static getStore(companyId: string): RedisTokenStore | undefined {
//     return CompanyTokenManager.instances.get(companyId);
//   }
//   static async clearCompany(companyId: string): Promise<void> {
//     const store = CompanyTokenManager.instances.get(companyId);
//     if (store) {
//       await store.clearTokens();
//       CompanyTokenManager.instances.delete(companyId);
//     }
//   }
//   static async clearAll(): Promise<void> {
//     const promises = Array.from(CompanyTokenManager.instances.entries()).map(
//       async ([companyId, store]) => {
//         await store.clearTokens();
//       }
//     );
//     await Promise.all(promises);
//     CompanyTokenManager.instances.clear();
//   }
//   // Static method to get statistics across all companies
//   static async getGlobalStatistics(): Promise<Record<string, any>> {
//     const globalStats: Record<string, any> = {};
//     const promises = Array.from(CompanyTokenManager.instances.entries()).map(
//       async ([companyId, store]) => {
//         const manager = new CompanyTokenManager(companyId);
//         globalStats[companyId] = {
//           total_tokens: await manager.count(),
//           status_breakdown: await manager.getTokenStatisticsByStatus(),
//         };
//       }
//     );
//     await Promise.all(promises);
//     return globalStats;
//   }
//   async priorityTokens()
//     : Promise<ITokenData[] | any> {
//     const seriesOfCounter = await prisma.ht_counter_filter.findUniqueOrThrow({
//       where: {
//         hash_id: this.param.counter_id,
//         deleted_at: null,
//       },
//       select: {
//         series: true
//       }
//     })
//     const seriesListOfCounter = seriesOfCounter.series.split(",").map(Number)
//     const seriesList = await prisma.ht_series.findMany({
//       where: {
//         id: {
//           in: seriesListOfCounter
//         },
//         company: {
//           hash_id:  this.param.company_id
//         },
//         deleted_at: null
//       },
//       select: {
//         abbreviation: true,
//         priority: true
//       }
//     })
//     for (let i = 1; i <= 10; i++) {
//       const token = createDummyToken(i);
//       this.addToken(token);
//     }
//     const tokenListData = await this.getTokens()
//     console.log('tokenListData >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', tokenListData)
//     const filteredToken = tokenListData.filter((token) => {
//       // console.log('token :>> ', token);
//       if (token.company_id === this.param.company_id
//       ) {
//         return token;
//       }
//     })
//     console.log('filteredToken', filteredToken)
//   }
// }
class CompanyTokenManager {
    static instances = new Map();
    store;
    param;
    constructor(companyId, counterId) {
        this.param = {
            company_id: companyId,
            counter_id: counterId
        };
        if (!CompanyTokenManager.instances.has(this.param.company_id)) {
            CompanyTokenManager.instances.set(this.param.company_id, new RedisTokenStore(this.param.company_id));
        }
        this.store = CompanyTokenManager.instances.get(this.param.company_id);
    }
    compareTokens = (a, b) => {
        if (a.priority !== b.priority) {
            return b.priority - a.priority;
        }
        return a.token_generate_time.getTime() - b.token_generate_time.getTime();
    };
    async addToken(token) {
        await this.store.addToken(token);
    }
    async getTokens() {
        return await this.store.getTokens();
    }
    async getTokensByStatus(status) {
        return await this.store.getTokensByStatus(status);
    }
    async getTokensBySeries(seriesId) {
        return await this.store.getTokensBySeries(seriesId);
    }
    async updateToken(tokenId, updates) {
        await this.store.updateToken(tokenId, updates);
    }
    async removeToken(tokenId) {
        await this.store.removeToken(tokenId);
    }
    async clearTokens() {
        await this.store.clearTokens();
    }
    async isEmpty() {
        return await this.store.isEmpty();
    }
    async count() {
        return await this.store.count();
    }
    async getTokenStatisticsByStatus() {
        return await this.store.getTokenStatisticsByStatus();
    }
    static getAllCompanyIds() {
        return Array.from(CompanyTokenManager.instances.keys());
    }
    static getStore(companyId) {
        return CompanyTokenManager.instances.get(companyId);
    }
    static async clearCompany(companyId) {
        const store = CompanyTokenManager.instances.get(companyId);
        if (store) {
            await store.clearTokens();
            CompanyTokenManager.instances.delete(companyId);
        }
    }
    static async clearAll() {
        const promises = Array.from(CompanyTokenManager.instances.entries()).map(async ([companyId, store]) => {
            await store.clearTokens();
        });
        await Promise.all(promises);
        CompanyTokenManager.instances.clear();
    }
    static async getGlobalStatistics() {
        const globalStats = {};
        const promises = Array.from(CompanyTokenManager.instances.entries()).map(async ([companyId, store]) => {
            const manager = new CompanyTokenManager(companyId);
            globalStats[companyId] = {
                total_tokens: await manager.count(),
                status_breakdown: await manager.getTokenStatisticsByStatus(),
            };
        });
        await Promise.all(promises);
        return globalStats;
    }
    // async priorityTokens(): Promise<ITokenData[] | any> {
    //   const seriesOfCounter = await prisma.ht_counter_filter.findUniqueOrThrow({
    //     where: {
    //       hash_id: this.param.counter_id,
    //       deleted_at: null,
    //     },
    //     select: {
    //       series: true
    //     }
    //   });
    //   const seriesListOfCounter = seriesOfCounter.series.split(",").map(Number);
    //   const seriesList = await prisma.ht_series.findMany({
    //     where: {
    //       id: {
    //         in: seriesListOfCounter
    //       },
    //       company: {
    //         hash_id: this.param.company_id
    //       },
    //       deleted_at: null
    //     },
    //     select: {
    //       abbreviation: true,
    //       priority: true
    //     }
    //   });
    //   // Add dummy tokens
    //   // for (let i = 1; i <= 10; i++) {
    //   //   const token = createDummyToken(i);
    //   //   await this.addToken(token); // Now properly calls this.store.addToken
    //   // }
    //   const tokenListData = await this.getTokens(); // Now properly calls this.store.getTokens
    //   // console.log('tokenListData >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', tokenListData);
    //   // FIX 4: Use parseInt to compare numbers properly
    //   const filteredToken = tokenListData.filter((token) => {
    //     if (token.company_id === this.param.company_id) {
    //       return token;
    //     }
    //   });
    //   console.log('filteredToken', filteredToken);
    //   return filteredToken;
    // }
    // ******** 2ND
    // async priorityTokens(): Promise<ITokenData[]> {
    //   // for (let i = 1; i <= 10; i++) {
    //   //   const token = createDummyToken(i);
    //   //   await this.addToken(token);
    //   // }
    //   // const allTokens = await this.getTokens();
    //   // console.log(' =============== ', allTokens)
    //   console.log('counter_id', this.param.counter_id)
    //   const seriesOfCounter = await prisma.ht_counter_filter.findUniqueOrThrow({
    //     where: {
    //       hash_id: this.param.counter_id,
    //       deleted_at: null,
    //     },
    //     select: {
    //       series: true
    //     }
    //   });
    //   console.log('seriesOfCounter', seriesOfCounter)
    //   const seriesListOfCounter = seriesOfCounter.series.split(",").map(Number);
    //   console.log('seriesListOfCounter', seriesListOfCounter)
    //   const seriesList = await prisma.ht_series.findMany({
    //     where: {
    //       id: {
    //         in: seriesListOfCounter
    //       },
    //       company: {
    //         hash_id: this.param.company_id
    //       },
    //       deleted_at: null
    //     },
    //     select: {
    //       abbreviation: true,
    //       priority: true
    //     }
    //   });
    //   console.log('seriesList', seriesList)
    //   const seriesMap = new Map<string, number>();
    //   seriesList.forEach(series => {
    //     seriesMap.set(series.abbreviation, series.priority);
    //   });
    //   const tokenListData = await this.getTokens();
    //   const filteredTokens = tokenListData.filter((token) => {
    //     return token.company_id === this.param.company_id &&
    //       seriesMap.has(token.token_abbreviation);
    //   });
    //   const sortedTokens = filteredTokens.sort((a, b) => {
    //     const aPriority = seriesMap.get(a.token_abbreviation) || 0;
    //     const bPriority = seriesMap.get(b.token_abbreviation) || 0;
    //     if (aPriority !== bPriority) {
    //       return bPriority - aPriority;
    //     }
    //     const aTime = new Date(a.token_generate_time).getTime();
    //     const bTime = new Date(b.token_generate_time).getTime();
    //     return aTime - bTime;
    //   });
    //   console.log('sortedTokens', sortedTokens)
    //   return sortedTokens.slice(0, 2);
    // }
    // *********** 3RD
    async priorityTokens() {
        const seriesOfCounter = await prisma_1.default.ht_counter_filter.findUniqueOrThrow({
            where: {
                hash_id: this.param.counter_id,
                deleted_at: null,
            },
            select: {
                series: true
            }
        });
        const seriesListOfCounter = seriesOfCounter.series.split(",").map(Number);
        const seriesList = await prisma_1.default.ht_series.findMany({
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
        const filteredTokens = tokenListData.filter(token => token.company.id === this.param.company_id &&
            allowedAbbreviations.includes(token.token_abbreviation));
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
exports.CompanyTokenManager = CompanyTokenManager;
//# sourceMappingURL=redis-token-manager.js.map