import prisma from "@/lib/prisma";

export interface ITokenData {
  token_id: string;
  token_abbreviation: string;
  series_id: number;
  token_number: number;
  token_date: Date;
  priority: number;
  token_status: TokenStatus;
  token_series_number: string;
  token_calling_time: Date | null;
  token_out_time: Date | null;
  language_id: number;
  company_id: number;
  customer_name: string | null;
  customer_mobile_number: string | null;
  token_generate_time: Date;
}

function createDummyToken(index: number): ITokenData {
  return {
    token_id: `tok_00${index}`,
    token_abbreviation: index % 2 === 0 ? "A" : "B",
    series_id: 1,
    token_number: 100 + index,
    token_date: new Date(),
    priority: index,
    token_status: TokenStatus.PENDING,
    token_series_number: index % 2 === 0 ? "A" : "B",
    token_calling_time: null,
    token_out_time: null,
    language_id: 1,
    company_id: index === 10 ? 5 : 50,
    customer_name: `Customer ${index}`,
    customer_mobile_number: `98765432${10 + index}`,
    token_generate_time: new Date()
  };
}

export enum TokenStatus {
  PENDING = "PENDING",
  CALLED = "CALLED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

class TokenStore {
  private tokens: ITokenData[] = [];

  addToken(token: ITokenData): void {
    this.tokens.push(token);
  }

  getTokens(): ITokenData[] {
    return [...this.tokens];
  }

  clearTokens(): void {
    this.tokens = [];
  }

  isEmpty(): boolean {
    return this.tokens.length === 0;
  }

  count(): number {
    return this.tokens.length;
  }
}

export class CompanyTokenManager {
  private static instances: Map<string, TokenStore> = new Map();
  private store: TokenStore;
  private param: Record<string, any>;

  constructor(companyId: number, counterId?: number) {
    this.param = {
      company_id: companyId,
      counter_id: counterId
    };
    // if (!CompanyTokenManager.instances.has(companyId)) {
    //   CompanyTokenManager.instances.set(companyId, new TokenStore());
    // }

    // this.store = CompanyTokenManager.instances.get(companyId)!;
  }

  addToken(token: ITokenData) {
    this.store.addToken(token);
  }

  getTokens(): ITokenData[] {
    return this.store.getTokens();
  }

  clearTokens(): void {
    this.store.clearTokens();
  }

  isEmpty(): boolean {
    return this.store.isEmpty();
  }

  count(): number {
    return this.store.count();
  }

  static getAllCompanyIds(): string[] {
    return Array.from(CompanyTokenManager.instances.keys());
  }

  static getStore(companyId: string): TokenStore | undefined {
    return CompanyTokenManager.instances.get(companyId);
  }

  static clearCompany(companyId: string): void {
    CompanyTokenManager.instances.delete(companyId);
  }

  static clearAll(): void {
    CompanyTokenManager.instances.clear();
  }

  async priorityTokens()
    : Promise<ITokenData[] | any> {

    const seriesOfCounter = await prisma.ht_counter_filter.findUniqueOrThrow({
      where: {
        id: this.param.counter_id,
        deleted_at: null,
      },
      select: {
        series: true
      }
    })

    const seriesListOfCounter = seriesOfCounter.series.split(",").map(Number)

    const seriesList = await prisma.ht_series.findMany({
      where: {
        id: {
          in: seriesListOfCounter
        },
        comapany_id: this.param.company_id,
        deleted_at: null
      },
      select: {
        abbreviation: true,
        priority: true
      }
    })

    // for (let i = 1; i <= 10; i++) {
    //   const token = createDummyToken(i);
    //   this.addToken(token);
    // }

    const tokenListData = this.getTokens()
// console.log('tokenListData >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', tokenListData)
    const filteredToken = tokenListData.filter((token) => {
      // console.log('token :>> ', token);
      if (token.company_id === this.param.company_id

      ) {
        return token;
      }
    })

    console.log('filteredToken', filteredToken)

  }
}