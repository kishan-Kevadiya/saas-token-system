import { TokenStatus } from '@prisma/client';
import type { GenerateTokenCreateInputDto } from './dto/token.dto';
import prisma from '@/lib/prisma';
import { HttpBadRequestError, HttpNotFoundError } from '@/lib/errors';
import {
  CompanyTokenManager,
  type ITokenData,
} from '@/utils/redis-token-manager';

export default class TokenService {
  public async generateToken(data: GenerateTokenCreateInputDto) {
    const {
      company_id: companyId,
      series_id: seriesId,
      name: customerName,
      mobile_number: mobileNumber,
      form_data: formData,
      language_id: languageId,
    } = data;

    const [company, series, language] = await Promise.all([
      prisma.ht_company.findUnique({
        where: {
          hash_id: companyId,
          deleted_at: null,
        },
        select: {
          id: true,
          company_name: true,
          hash_id: true,
          asccode: true,
          saturday_off: true,
          sunday_off: true,
          app_hour: true,
        },
      }),

      prisma.ht_series.findUnique({
        where: {
          hash_id: seriesId,
          deleted_at: null,
          is_active: 1,
        },
        select: {
          id: true,
          hash_id: true,
          display_form: true,
          abbreviation: true,
          start_token: true,
          end_token: true,
          start_time: true,
          end_time: true,
          is_active: true,
          priority: true,
        },
      }),

      prisma.ht_languages.findUnique({
        where: {
          hash_id: languageId,
          deleted_at: null,
        },
        select: {
          id: true,
          name: true,
          hash_id: true,
          code: true
        },
      }),
    ]);

    if (!company) throw new HttpNotFoundError('Company not found');
    if (!series) throw new HttpNotFoundError('Series not found');
    if (!language) throw new HttpNotFoundError('Language not found');

    await this.validateBusinessHours(company, series);

    const nextTokenNumber = await this.getNextTokenNumber(
      company.id,
      series.id
    );

    const tokenNumber = nextTokenNumber ?? series.start_token ?? 1;

    if (series.end_token != null && tokenNumber > series.end_token) {
      throw new HttpBadRequestError(
        `Token generation is not allowed beyond ${series.end_token}`
      );
    }

    const result = await prisma.$transaction(async (prisma) => {
      const token = await prisma.tokens.create({
        data: {
          company_id: company.id,
          series_id: series.id,
          customer_name: customerName,
          customer_mobile_number: mobileNumber,
          language_id: language.id,
          token_abbreviation: series.abbreviation,
          token_series_number: `${series.abbreviation}-${tokenNumber}`,
          token_number: tokenNumber,
          token_status: TokenStatus.WAITING,
          priority: series.priority,
          token_date: new Date(),
        },
        select: {
          id: true,
          hash_id: true,
          token_series_number: true,
          token_series: true,
          token_number: true,
          token_status: true,
          generate_token_time: true,
          company_id: true,
          series_id: true,
          language_id: true,
          customer_mobile_number: true,
          customer_name: true,
          token_abbreviation: true,
          token_date: true,
          priority: true,
          created_at: true,
          time_taken: true
        },
      });

      if (formData && Object.keys(formData).length > 0) {
        await prisma.ht_appointment_token_form_data.create({
          data: {
            company_id: company.id,
            token_id: token.id,
            form_data: formData,
          },
        });
      }

      return token;
    });

    const inMemoryToken: ITokenData = {
      token_id: result.hash_id,
      token_abbreviation: result.token_abbreviation,
      series: {
        id: series.id,
        hash_id: series.hash_id
      },
      token_number: result.token_number,
      token_date: result.token_date,
      priority: result.priority,
      token_status: result.token_status,
      token_series_number: result.token_series_number,
      token_calling_time: null,
      token_out_time: null,
      language: {
        id: language.id,
        hash_id: language.hash_id,
        name: language.name,
        code: language.code
      },
      company: {
        id: company.id,
        hash_id: company.hash_id,
        name: company.company_name
      },
      customer_name: result.customer_name,
      customer_mobile_number: result.customer_mobile_number,
      token_generate_time: result.created_at,
      form_data: formData,
      transfer_counter: null,
      transfer_department: null,
      time_taken: result.time_taken
    };

    console.log("inMemoryToken", inMemoryToken)
    const tokenManager = new CompanyTokenManager(company.hash_id);
    await tokenManager.addToken(inMemoryToken);

    // const redisData = {
    //   token_id: result.id,
    //   series_id: series.id,
    //   priority: series.priority,
    //   company_id: company.id,
    //   token_status: result.token_status,
    // };

    // await saveTokenToRedis(result.id, redisData);

    // const results = await searchPendingTokensBySeries([2, 3]);
    // console.log('Search Results:', JSON.stringify(results, null, 2));
    return result;
  }

  private async validateBusinessHours(
    company: any,
    series: any
  ): Promise<void> {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);

    if (currentDay === 0 && company.sunday_off === 1) {
      throw new HttpBadRequestError(
        'Token generation is not allowed on Sundays'
      );
    }

    if (currentDay === 6 && company.saturday_off === 1) {
      throw new HttpBadRequestError(
        'Token generation is not allowed on Saturdays'
      );
    }

    if (series.start_time && series.end_time) {
      const startTime = series.start_time;
      const endTime = series.end_time;

      if (currentTime < startTime || currentTime > endTime) {
        throw new HttpBadRequestError(
          `Token generation is only allowed between ${startTime as string} and ${endTime as string}`
        );
      }
    }

    if (company.app_hour > 0) {
      //   const currentHour = now.getHours();
      //   if (currentHour >= company.app_hour) {
      //     throw new HttpBadRequestError(
      //       `Token generation is not allowed after ${company.app_hour as string}:00`
      //     );
      //   }
    }
  }

  private async getNextTokenNumber(
    companyId: number,
    seriesId: number
  ): Promise<number | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const lastToken = await prisma.tokens.findFirst({
      where: {
        company_id: companyId,
        series_id: seriesId,
        token_date: {
          gte: today,
          lt: tomorrow,
        },
        deleted_at: null,
      },
      orderBy: {
        token_number: 'desc',
      },
      select: {
        token_number: true,
      },
    });

    return lastToken ? lastToken.token_number + 1 : null;
  }

  public async getTokensByCompany(companyId: string, date?: string) {
    const whereClause: any = {
      company: {
        hash_id: companyId,
        deleted_at: null,
      },
      deleted_at: null,
    };

    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      whereClause.token_date = {
        gte: targetDate,
        lt: nextDay,
      };
    }

    return await prisma.tokens.findMany({
      where: whereClause,
      include: {
        ht_appointment_token_form_data: {
          select: {
            form_data: true,
          },
        },
      },
      orderBy: [{ token_date: 'desc' }, { token_series_number: 'asc' }],
    });
  }
}

// const redisData = {
//   token_id: result.id,
//   series_id: series.id,
//   priority: series.priority,
//   company_id: company.id,
//   token_status: result.token_status,
// };

// await saveTokenToRedis(result.id, redisData);

// const results = await searchPendingTokensBySeries([2, 3]);
// console.log('Search Results:', JSON.stringify(results, null, 2));
