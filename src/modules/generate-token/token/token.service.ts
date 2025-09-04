import {
  PackageType,
  SeriesSelection,
  SeriesTokenGenerationType,
  TokenStatus,
} from '@prisma/client';
import type { GenerateTokenCreateInputDto } from './dto/token.dto';
import prisma from '@/lib/prisma';
import { HttpBadRequestError, HttpNotFoundError } from '@/lib/errors';
import {
  CompanyTokenManager,
  type ITokenData,
} from '@/utils/redis-token-manager';
import { CurrentUserDto } from '../auth/dto/current-user.dto';
import { generateNumericOTP } from '@/utils/generate-otp';
import { sendSms } from '@/utils/send-sms';
interface Counter {
  id: string;
  isActive: boolean;
  servingServiceId: string[];
}
interface SeriesProcessingData {
  seriesId: string;
  avgProcessingTime: number;
  tokensInQueue: ITokenData[];
}

export default class TokenService {
  public async generateToken(data: GenerateTokenCreateInputDto, currentUser: CurrentUserDto) {
    const {
      series_id: seriesId,
      name: customerName,
      form_data: formData,
      language_id: languageId,
    } = data;

    const [company, series, language] = await Promise.all([
      prisma.ht_company.findUnique({
        where: {
          id: currentUser.id,
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
          ht_company_settings: {
            where: {
              deleted_at: null,
              company_id: currentUser.id,
            },
            select: {
              series_token_generate_type: true,
            },
          },
          main_company: {
            select : {
              token_limit: true,
              expired_at: true,
              type: true
            }
          }
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
          is_series_generate_type_apply: true,
          display_form: true,
          abbreviation: true,
          start_token: true,
          end_token: true,
          start_time: true,
          end_time: true,
          is_active: true,
          priority: true,
          is_otp_required: true,
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
          code: true,
        },
      }),
    ]);

    if (!company) throw new HttpNotFoundError('Company not found');
    if (!series) throw new HttpNotFoundError('Series not found');
    if (!language) throw new HttpNotFoundError('Language not found');

    await this.validateTokenGeneration(company.hash_id, company.main_company.token_limit ?? 10, company.main_company.expired_at, company.main_company.type)

    await this.validateBusinessHours(company, series);

    if (formData && Object.keys(formData).length > 0) {
      await this.validateFormData(series.id, formData);
    }

    const nextTokenNumber = await this.getNextTokenNumber(company.id, {
      id: series.id,
      settingAppyle: series.is_series_generate_type_apply,
    });

    if (
      company.ht_company_settings[0]?.series_token_generate_type !==
      SeriesTokenGenerationType.RangeTokenGeneration
    ) {
      series.start_token = 1;
    }

    const tokenNumber = nextTokenNumber ?? series.start_token ?? 1;

    if (series.end_token != null && tokenNumber > series.end_token) {
      throw new HttpBadRequestError(
        `Token generation is not allowed beyond ${series.end_token}`
      );
    }

    let mobileNumber: string | null = null

    let otp: string | null = null;
     if( series.is_otp_required === 1 ) {

      const formFileds = await prisma.ht_series_input_fields.findFirst({
        where: {
          series_id: series.id,
          deleted_at: null,
          is_verification_field: 1,
        }
      })

      if(!formFileds){
        throw new HttpBadRequestError('OTP field is not configured for this series');
      }

       mobileNumber = data.form_data ? data.form_data[formFileds.field_english_name] || data.form_data[formFileds.field_hindi_name] || data.form_data[formFileds.field_regional_name] : null;

      console.log('mobileNumber', mobileNumber)
      if(!mobileNumber) {
        throw new HttpBadRequestError('Mobile number is required for OTP verification');
      }
       otp = generateNumericOTP(6);
      //  await sendSms(mobileNumber, `Dear Customer, OTP to verfify your mobile number is ${otp}, Netsol IT Solutions.`);
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
          time_taken: true,
        },
      });


      if( series.is_otp_required === 1 ) {
        if(!otp || !mobileNumber) {
          throw new HttpBadRequestError('Mobile number is required for OTP verification');
      }

      await prisma.otp.create({
        data: {
          token_id: token.id,
          otp: Number(otp),
          company_id: company.id,
          mobile_no: mobileNumber,
          expired_at: new Date(Date.now() + 5 * 60 * 1000),
        }
      });
    }
      // await prisma.token_logs.create({
      //   data: {
      //     company_id: token.company_id,
      //     token_id: token.id,
      //     current_status: TokenStatus.WAITING,
      //     time_taken: token.time_taken,
      //   }
      // })

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
        hash_id: series.hash_id,
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
        code: language.code,
      },
      company: {
        id: company.id,
        hash_id: company.hash_id,
        name: company.company_name,
      },
      customer_name: result.customer_name,
      customer_mobile_number: result.customer_mobile_number,
      token_generate_time: result.created_at,
      form_data: formData,
      transfer_counter: null,
      transfer_department: null,
      time_taken: result.time_taken,
      created_at: result.created_at,
    };

    const tokenManager = new CompanyTokenManager(company.hash_id);
    // await tokenManager.clearTokens()
    await tokenManager.addToken(inMemoryToken);

    const response = {
      token_id: result.hash_id,
      token_abbreviation: result.token_abbreviation,
      series_id: series.hash_id,
      token_number: result.token_number,
      token_date: result.token_date,
      priority: result.priority,
      token_status: result.token_status,
      token_series_number: result.token_series_number,
      token_calling_time: null,
      token_out_time: null,
      language: {
        id: language.hash_id,
        name: language.name,
        code: language.code,
      },
      company: {
        id: company.hash_id,
        name: company.company_name,
      },
      customer_name: result.customer_name,
      customer_mobile_number: result.customer_mobile_number,
      token_generate_time: result.created_at,
      form_data: formData,
      transfer_counter: null,
      transfer_department: null,
      time_taken: result.time_taken,
      hold_in_time: null,
      hold_out_time: null,
      reason: null,
    };
    return response;
  }

  private async validateFormData(
    seriesId: number,
    formData: any
  ): Promise<void> {
    const inputFields = await prisma.ht_series_input_fields.findMany({
      where: {
        series_id: seriesId,
        deleted_at: null,
      },
      select: {
        field_english_name: true,
        field_hindi_name: true,
        field_regional_name: true,
        field_type: true,
        is_required: true,
      },
    });

    if (inputFields.length === 0) {
      return;
    }

    const errors: string[] = [];

    for (const field of inputFields) {
      const isRequired = field.is_required === 1;
      const fieldType = field.field_type.toLowerCase();

      const possibleFieldNames = [
        field.field_english_name,
        field.field_hindi_name,
        field.field_regional_name,
      ].filter((name) => name && name.trim() !== '');

      let fieldValue: any;
      let usedFieldName: string = '';

      for (const fieldName of possibleFieldNames) {
        if (Object.prototype.hasOwnProperty.call(formData, fieldName)) {
          fieldValue = formData[fieldName];
          usedFieldName = fieldName;
          break;
        }
      }

      if (
        isRequired &&
        (fieldValue === undefined || fieldValue === null || fieldValue === '')
      ) {
        const fieldDisplayName =
          field.field_english_name ||
          field.field_hindi_name ||
          field.field_regional_name;
        errors.push(`Field '${fieldDisplayName}' is required`);
        continue;
      }

      if (
        fieldValue === undefined ||
        fieldValue === null ||
        fieldValue === ''
      ) {
        continue;
      }

      switch (fieldType) {
        case 'text':
        case 'textarea':
          if (typeof fieldValue !== 'string') {
            errors.push(`Field '${usedFieldName}' must be a string`);
          }
          break;

        case 'number':
          if (
            typeof fieldValue !== 'number' &&
            !(!isNaN(Number(fieldValue)) && isFinite(Number(fieldValue)))
          ) {
            errors.push(`Field '${usedFieldName}' must be a valid number`);
          }
          break;

        case 'email':
          if (
            typeof fieldValue !== 'string' ||
            !this.isValidEmail(fieldValue)
          ) {
            errors.push(
              `Field '${usedFieldName}' must be a valid email address`
            );
          }
          break;

        case 'phone':
        case 'mobile':
          if (
            typeof fieldValue !== 'string' ||
            !this.isValidPhone(fieldValue)
          ) {
            errors.push(
              `Field '${usedFieldName}' must be a valid phone number`
            );
          }
          break;

        case 'date':
          if (!this.isValidDate(fieldValue)) {
            errors.push(
              `Field '${usedFieldName}' must be a valid date (YYYY-MM-DD format)`
            );
          }
          break;

        case 'time':
          if (typeof fieldValue !== 'string' || !this.isValidTime(fieldValue)) {
            errors.push(
              `Field '${usedFieldName}' must be a valid time (HH:MM format)`
            );
          }
          break;

        case 'datetime':
          if (!this.isValidDateTime(fieldValue)) {
            errors.push(`Field '${usedFieldName}' must be a valid datetime`);
          }
          break;

        case 'select':
        case 'dropdown':
          if (
            typeof fieldValue !== 'string' &&
            typeof fieldValue !== 'number'
          ) {
            errors.push(`Field '${usedFieldName}' must be a valid selection`);
          }
          break;

        case 'checkbox':
          if (
            typeof fieldValue !== 'boolean' &&
            fieldValue !== 0 &&
            fieldValue !== 1 &&
            fieldValue !== 'true' &&
            fieldValue !== 'false'
          ) {
            errors.push(
              `Field '${usedFieldName}' must be a valid boolean value`
            );
          }
          break;

        case 'radio':
          if (
            typeof fieldValue !== 'string' &&
            typeof fieldValue !== 'number'
          ) {
            errors.push(
              `Field '${usedFieldName}' must be a valid radio selection`
            );
          }
          break;

        case 'file':
        case 'image':
          if (typeof fieldValue !== 'string') {
            errors.push(
              `Field '${usedFieldName}' must be a valid file reference`
            );
          }
          break;

        default:
          if (isRequired && !fieldValue) {
            errors.push(`Field '${usedFieldName}' is required`);
          }
          break;
      }
    }

    const allowedFields: string[] = [];
    inputFields.forEach((field) => {
      if (field.field_english_name)
        allowedFields.push(field.field_english_name);
      if (field.field_hindi_name) allowedFields.push(field.field_hindi_name);
      if (field.field_regional_name)
        allowedFields.push(field.field_regional_name);
    });

    const providedFields = Object.keys(formData);
    const unexpectedFields = providedFields.filter(
      (field) => !allowedFields.includes(field)
    );

    if (unexpectedFields.length > 0) {
      errors.push(`Unexpected fields provided: ${unexpectedFields.join(', ')}`);
    }

    if (errors.length > 0) {
      throw new HttpBadRequestError(
        `Form validation failed: ${errors.join(', ')}`
      );
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    // const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    // return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    return true;
  }

  private isValidDate(date: any): boolean {
    if (typeof date === 'string') {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) return false;
      const parsedDate = new Date(date);
      return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
    }
    return date instanceof Date && !isNaN(date.getTime());
  }

  private isValidTime(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  private isValidDateTime(datetime: any): boolean {
    if (typeof datetime === 'string') {
      const parsedDate = new Date(datetime);
      return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
    }
    return datetime instanceof Date && !isNaN(datetime.getTime());
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
    series: {
      id: number;
      settingAppyle: number;
    }
  ): Promise<number | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const companySetting = await prisma.ht_company_settings.findFirst({
      where: {
        company_id: companyId,
        deleted_at: null,
      },
      select: {
        id: true,
        hash_id: true,
        series_selection: true,
        series_token_generate_type: true,
      },
    });

    const whereClause: any = {
      company_id: companyId,

      token_date: {
        gte: today,
        lt: tomorrow,
      },
      deleted_at: null,
    };
    if (companySetting?.series_selection === SeriesSelection.MULTIPLE) {
      throw new Error('this is not implement');
    }
    if (
      companySetting?.series_token_generate_type !==
      SeriesTokenGenerationType.SharedTokenSeries
    ) {
      if (series.settingAppyle === 1) {
        whereClause.series_id = series.id;
      } else {
        const seriesData = await prisma.ht_series.findMany({
          where: {
            comapany_id: companyId,
            is_series_generate_type_apply: 1,
          },
        });
        const seriesIds = seriesData.map((data) => data.id);
        whereClause.series_id = {
          notIn: seriesIds,
        };
      }
    }

    const lastToken = await prisma.tokens.findFirst({
      where: whereClause,
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

  public async validateTokenGeneration(
  companyId: string,
  tokenLimit: number,
  expireDate: Date,
  packageType: PackageType
) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const gracePeriod = new Date(expireDate);
  gracePeriod.setDate(gracePeriod.getDate() + 7);

  if (today > gracePeriod) {
    throw new HttpBadRequestError(
      "Your package has expired. Please renew to generate tokens."
    );
  }

  if(packageType === PackageType.FREE) {
  const tokenManager = new CompanyTokenManager(companyId);
  const tokens = await tokenManager.getTokens();

  const tokenCount = tokens.filter((data) => {
    const tokenDateStr = new Date(data.token_date).toISOString().split("T")[0];
    return tokenDateStr === todayStr;
  }).length;

  console.log('tokenLimit => ', tokenLimit)
  console.log('tokenCount => ', tokenCount)
  if (tokenCount >= tokenLimit) {
    throw new HttpBadRequestError(
      "Token limit is over, please upgrade your plan to generate more tokens"
    );
  }
}
}

  private timeStringToSeconds(timeString: string): number {
    if (!timeString) return 0;

    const parts = timeString.split(':');
    if (parts.length !== 3) return 0;

    const hours = parseInt(parts[0], 10) ?? 0;
    const minutes = parseInt(parts[1], 10) ?? 0;
    const seconds = parseInt(parts[2], 10) ?? 0;

    return hours * 3600 + minutes * 60 + seconds;
  }


  /**
   * Convert seconds to time string 'HH:MM:SS'
   */
  private secondsToTimeString(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Validate if time_taken string is reasonable (not outlier)
   */
  private isValidServiceTime(timeString: string): boolean {
    if (!timeString) return false;

    const seconds = this.timeStringToSeconds(timeString);
    // Valid range: 10 seconds to 2 hours (7200 seconds)
    return seconds >= 10 && seconds <= 7200;
  }

  /**
   * Calculate waiting time considering multiple series on same counter
   */
  private async calculateWaitingTimeWithMultipleSeries(
    tokens: ITokenData[],
    counters: Counter[],
    currentTokenId: string,
    companyId: string
  ): Promise<number> {
    const currentToken = tokens.find((t) => t.token_id === currentTokenId);
    if (!currentToken) throw new Error('Token not found');

    // Find which counters can serve this token's series
    const availableCounters = counters.filter((counter) =>
      counter.servingServiceId.includes(currentToken.series.id.toString())
    );

    if (availableCounters.length === 0) return Infinity;

    // Calculate waiting time for each available counter and take minimum
    const waitingTimes = await Promise.all(
      availableCounters.map(
        async (counter) =>
          await this.calculateWaitingTimeForSpecificCounter(
            tokens,
            counter,
            currentTokenId,
            companyId
          )
      )
    );

    return Math.min(...waitingTimes);
  }

  /**
   * Calculate waiting time for a specific counter handling multiple series
   */
  private async calculateWaitingTimeForSpecificCounter(
    tokens: ITokenData[],
    counter: Counter,
    currentTokenId: string,
    companyId: string
  ): Promise<number> {
    const currentToken = tokens.find((t) => t.token_id === currentTokenId);

    if (!currentToken) {
      throw new Error('currentToken not found');
    }

    // Get processing data for all series this counter handles
    const seriesProcessingData = await Promise.all(
      counter.servingServiceId.map(
        async (seriesId) =>
          await this.getSeriesProcessingData(tokens, seriesId, companyId)
      )
    );

    // Get all tokens ahead of current token across all series
    const allRelevantTokens = this.getAllTokensAheadInQueue(
      tokens,
      counter,
      currentToken
    );

    // Sort all tokens by priority and generation time (global queue for this counter)
    allRelevantTokens.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.token_generate_time.getTime() - b.token_generate_time.getTime();
    });

    // Find position of current token in the combined queue
    const currentTokenPosition = allRelevantTokens.findIndex(
      (t) => t.token_id === currentTokenId
    );

    if (currentTokenPosition === -1) return 0; // Token not in queue

    // Calculate cumulative processing time for all tokens ahead
    let totalWaitingTime = 0;

    // Add time for currently serving token (if any)
    const currentlyServing = allRelevantTokens.find(
      (t) => t.token_status === TokenStatus.ACTIVE
    );
    if (currentlyServing) {
      const servingSeriesData = seriesProcessingData.find(
        (s) => s.seriesId === currentlyServing.series.id.toString()
      );
      if (servingSeriesData) {
        // Assume currently serving token is halfway done
        totalWaitingTime += servingSeriesData.avgProcessingTime * 0.5;
      }
    }

    // Add processing time for each token ahead in queue
    for (let i = 0; i < currentTokenPosition; i++) {
      const tokenAhead = allRelevantTokens[i];
      if (tokenAhead.token_status === TokenStatus.WAITING) {
        const tokenSeriesData = seriesProcessingData.find(
          (s) => s.seriesId === tokenAhead.series.id.toString()
        );
        if (tokenSeriesData) {
          totalWaitingTime += tokenSeriesData.avgProcessingTime;
        }
      }
    }

    return totalWaitingTime;
  }

  /**
   * Get all tokens that are ahead of current token in the counter's queue
   */
  private getAllTokensAheadInQueue(
    tokens: ITokenData[],
    counter: Counter,
    currentToken: ITokenData
  ): ITokenData[] {
    // Get all waiting and active tokens for series this counter handles
    const relevantTokens = tokens.filter(
      (token) =>
        counter.servingServiceId.includes(token.series.id.toString()) &&
        (token.token_status === TokenStatus.WAITING ||
          token.token_status === TokenStatus.ACTIVE) &&
        // Only include tokens generated before or at the same time as current token
        token.token_generate_time <= currentToken.token_generate_time
    );

    return relevantTokens;
  }

  /**
   * Get processing data for a specific series
   */
  private async getSeriesProcessingData(
    tokens: ITokenData[],
    seriesId: string,
    companyId: string
  ): Promise<SeriesProcessingData> {
    // Get recent completed tokens for this series
    const recentCompletedTokens = await this.getRecentCompletedTokensForSeries(
      tokens,
      seriesId,
      companyId
    );

    // Calculate average processing time
    const avgProcessingTime = this.calculateAvgProcessingTime(
      recentCompletedTokens
    );

    // Get tokens currently in queue for this series
    const tokensInQueue = tokens.filter(
      (token) =>
        token.series.id.toString() === seriesId &&
        (token.token_status === TokenStatus.WAITING ||
          token.token_status === TokenStatus.ACTIVE)
    );

    return {
      seriesId,
      avgProcessingTime,
      tokensInQueue,
    };
  }

  /**
   * Get recent completed tokens for a series (last 24 hours or last 50 tokens)
   */
  private async getRecentCompletedTokensForSeries(
    tokens: ITokenData[],
    seriesId: string,
    companyId: string
  ): Promise<ITokenData[]> {
    // const now = new Date();
    // const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let recentTokens = tokens.filter(
      (token) =>
        token.series.id.toString() === seriesId &&
        token.token_status === TokenStatus.COMPLETED &&
        token.time_taken &&
        this.isValidServiceTime(token.time_taken)
    );

    // If not enough recent data, get last 50 completed tokens
    if (recentTokens.length < 10) {
      recentTokens = tokens
        .filter(
          (token) =>
            token.series.id.toString() === seriesId &&
            token.token_status === TokenStatus.COMPLETED &&
            token.time_taken &&
            this.isValidServiceTime(token.time_taken)
        )
        .slice(0, 50);
    }

    return recentTokens;
  }

  /**
   * Calculate weighted average processing time
   */
  private calculateAvgProcessingTime(completedTokens: ITokenData[]): number {
    if (completedTokens.length === 0) return 300; // Default 5 minutes

    // Convert time strings to seconds and apply weights
    const weights = completedTokens.map((_, index) => {
      const recencyFactor = Math.exp(-index / 10); // Exponential decay
      return recencyFactor;
    });

    const weightedSum = completedTokens.reduce((sum, token, index) => {
      const timeInSeconds = this.timeStringToSeconds(token.time_taken);
      return sum + timeInSeconds * weights[index];
    }, 0);

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    const avgTime = weightedSum / totalWeight;

    // Apply time-of-day adjustment (optional)
    const timeAdjustment = this.getTimeOfDayAdjustment();

    return Math.max(30, avgTime * timeAdjustment); // Minimum 30 seconds
  }

  /**
   * Get time-of-day adjustment factor (peak hours = slower service)
   */
  private getTimeOfDayAdjustment(): number {
    const currentHour = new Date().getHours();

    // Peak hours: 10-12 AM and 2-4 PM (slower service)
    if (
      (currentHour >= 10 && currentHour <= 12) ||
      (currentHour >= 14 && currentHour <= 16)
    ) {
      return 1.2; // 20% slower
    }

    // Off-peak hours: early morning and late afternoon
    if (currentHour < 9 || currentHour > 17) {
      return 0.9; // 10% faster
    }

    return 1.0; // Normal speed
  }

  /**
   * Main public method to get comprehensive waiting time information
   */
  public async getComprehensiveWaitingTime(
    companyId: string,
    currentTokenId: string
  ): Promise<{
    waitingTimeSeconds: number;
    waitingTimeFormatted: string;
    positionInQueue: number;
    totalTokensAhead: number;
    counterInfo: {
      availableCounters: number;
      seriesHandled: string[];
      // currentlyServing: string[];
    };
    seriesBreakdown: {
      currentSeries: string;
      avgProcessingTime: string; // Format: 'HH:MM:SS'
      tokensAheadInSameSeries: number;
      tokensAheadInOtherSeries: number;
    };
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  }> {
    try {
      const tokenData = new CompanyTokenManager(companyId);
      const tokens = await tokenData.getTokens();
      const counters = await this.getCounters(companyId);
    
      const currentToken = tokens.find((t) => t.token_id === currentTokenId);
      if (!currentToken) throw new Error('Token not found');

      // Calculate waiting time
      const waitingTimeSeconds =
        await this.calculateWaitingTimeWithMultipleSeries(
          tokens,
          counters,
          currentTokenId,
          companyId
        );

      // Get available counters for this series
      const availableCounters = counters.filter((counter) =>
        counter.servingServiceId.includes(currentToken.series.id.toString())
      );

      // Get comprehensive queue information
      const queueInfo = await this.getQueueAnalysis(
        tokens,
        availableCounters,
        currentToken
      );

      // Calculate confidence based on data quality
      const confidence = await this.calculateConfidence(
        tokens,
        currentToken.series.id.toString()
      );

      return {
        waitingTimeSeconds,
        waitingTimeFormatted: this.formatTime(waitingTimeSeconds),
        positionInQueue: queueInfo.position,
        totalTokensAhead: queueInfo.totalAhead,
        counterInfo: {
          availableCounters: availableCounters.length,
          seriesHandled: availableCounters.flatMap((c) => c.servingServiceId),
          // currentlyServing: availableCounters
          //   .map(c => c.currentTokenId)
          //   .filter(id => id !== undefined) as string[]
        },
        seriesBreakdown: {
          currentSeries: currentToken.series.id.toString(),
          avgProcessingTime: this.secondsToTimeString(
            queueInfo.avgProcessingTime
          ),
          tokensAheadInSameSeries: queueInfo.sameSeriesAhead,
          tokensAheadInOtherSeries: queueInfo.otherSeriesAhead,
        },
        confidence,
      };
    } catch (error) {
      throw new Error(`Failed to calculate waiting time: ${error as string}`);
    }
  }

  private async getQueueAnalysis(
    tokens: ITokenData[],
    counters: Counter[],
    currentToken: ITokenData
  ) {
    // Implementation for detailed queue analysis
    const allRelevantTokens = counters.flatMap((counter) =>
      this.getAllTokensAheadInQueue(tokens, counter, currentToken)
    );

    // Remove duplicates and sort
    const uniqueTokens = Array.from(
      new Map(allRelevantTokens.map((t) => [t.token_id, t])).values()
    );

    uniqueTokens.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.token_generate_time.getTime() - b.token_generate_time.getTime();
    });

    const position =
      uniqueTokens.findIndex((t) => t.token_id === currentToken.token_id) + 1;
    const sameSeriesAhead = uniqueTokens
      .slice(0, position - 1)
      .filter((t) => t.series.id === currentToken.series.id).length;

    const otherSeriesAhead = position - 1 - sameSeriesAhead;

    // Get recent completed tokens to calculate avg processing time
    const recentCompleted = await this.getRecentCompletedTokensForSeries(
      tokens,
      currentToken.series.id.toString(),
      ''
    );
    const avgProcessingTime = this.calculateAvgProcessingTime(recentCompleted);

    return {
      position,
      totalAhead: position - 1,
      sameSeriesAhead,
      otherSeriesAhead,
      avgProcessingTime,
    };
  }

  private async calculateConfidence(
    tokens: ITokenData[],
    seriesId: string
  ): Promise<'HIGH' | 'MEDIUM' | 'LOW'> {
    const recent = await this.getRecentCompletedTokensForSeries(
      tokens,
      seriesId,
      ''
    );

    if (recent.length >= 20) return 'HIGH';
    if (recent.length >= 5) return 'MEDIUM';
    return 'LOW';
  }

  private formatTime(seconds: number): string {
    if (seconds === Infinity) return 'Indefinite wait';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    // const secs = Math.floor(seconds % 60);

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `< 1m`;
  }

  // Implement this based on your data access layer
  private async getCounters(companyId: string): Promise<Counter[]> {
    const counter = await prisma.ht_counter_filter.findMany({
      where : {
        company:{
          hash_id: companyId,
          
        },
        is_logged_in: 1,
        deleted_at: null
      }
    })
    return counter.map((data) => ({
      id: data.hash_id,
      isActive: true,
      servingServiceId: data.series.split(",")
    }))
    // throw new Error('Implement getCounters method');
  }

  /**
   * Simple method to get average service time for a specific series
   * Similar to your original getAvgWaitingTimeOfSeries method
   */
  public async getAvgServiceTimeForSeries(
    companyId: string,
    seriesId: string,
    limitToRecentTokens: boolean = true
  ): Promise<string> {
    try {
      const tokenData = new CompanyTokenManager(companyId);

      let completedTokens: ITokenData[];

      if (limitToRecentTokens) {
        // Get recent tokens (last 24 hours)
        const allTokens = await tokenData.getTokensByStatus(
          TokenStatus.COMPLETED
        );
        completedTokens = await this.getRecentCompletedTokensForSeries(
          allTokens,
          seriesId,
          companyId
        );
      } else {
        // Get all completed tokens for this series
        const allTokens = await tokenData.getTokensByStatus(
          TokenStatus.COMPLETED
        );
        completedTokens = allTokens.filter(
          (token) =>
            token.series.id.toString() === seriesId &&
            token.time_taken &&
            this.isValidServiceTime(token.time_taken)
        );
      }

      if (completedTokens.length === 0) {
        return '00:05:00'; // Default 5 minutes
      }

      // Calculate simple average (not weighted)
      const totalSeconds = completedTokens.reduce((sum, token) => {
        return sum + this.timeStringToSeconds(token.time_taken);
      }, 0);

      const avgSeconds = totalSeconds / completedTokens.length;

      return this.secondsToTimeString(avgSeconds);
    } catch (error) {
      console.error('Error calculating average service time:', error);
      return '00:05:00'; // Default fallback
    }
  }

  /**
   * Enhanced version of your original calculateWaitingTime method
   * Now handles time_taken as string format
   */
  public async calculateSimpleWaitingTime(
    // tokens: ITokenData[],
    // counters: Counter[],
    currentUser: CurrentUserDto,
    currentTokenId: string
    // companyId: string
  ): Promise<number> {
    // Get current token.includes(curren

    const tokenManager = new CompanyTokenManager(currentUser.hash_id);
    const tokens = await tokenManager.getTokens();
    const counters = await prisma.ht_counter_filter.findMany({
      where: {
        deleted_at: null,
        company_id: currentUser.id,
        is_logged_in: 1,
      },
      select: {
        id: true,
        hash_id: true,
        series: true,
      },
    });
    const currentToken = tokens.find((t) => t.token_id === currentTokenId);
    if (!currentToken) throw new Error('Token not found');

    // Get average service time for this series
    const avgServiceTimeString = await this.getAvgServiceTimeForSeries(
      currentUser.hash_id,
      currentToken.series.id.toString()
    );
    const avgServiceTimeSeconds =
      this.timeStringToSeconds(avgServiceTimeString);

    // Get all waiting/serving tokens for the same service
    const relevantTokens = tokens.filter(
      (t) =>
        t.series.id === currentToken.series.id &&
        (t.token_status === TokenStatus.WAITING ||
          t.token_status === TokenStatus.ACTIVE)
    );

    // Sort by priority DESC, then by generatedAt ASC
    relevantTokens.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.token_generate_time.getTime() - b.token_generate_time.getTime();
    });

    // Get position in queue (0-based)
    const position = relevantTokens.findIndex(
      (t) => t.token_id === currentTokenId
    );

    // Get active counters serving this service
    const activeCounters = counters.filter((c) =>
      c.series.includes(currentToken.series.id.toString())
    ).length;

    if (activeCounters === 0) return Infinity; // no active counters

    // Calculate effective position considering parallel serving
    const effectivePosition = Math.floor(position / activeCounters);

    // Calculate total waiting time
    const waitingTimeSeconds = effectivePosition * avgServiceTimeSeconds;

    return waitingTimeSeconds;
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
