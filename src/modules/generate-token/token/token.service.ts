import { SeriesSelection, SeriesTokenGenerationType, TokenStatus } from '@prisma/client';
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
          ht_company_settings: {
            where: {
              deleted_at: null,
              hash_id: companyId
            },
            select : {
              series_token_generate_type: true
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

    if (formData && Object.keys(formData).length > 0) {
      await this.validateFormData(series.id, formData);
    }

    const nextTokenNumber = await this.getNextTokenNumber(
      company.id,
      {
        id: series.id,
        settingAppyle: series.is_series_generate_type_apply
      }
    );

    if(company.ht_company_settings[0]?.series_token_generate_type !== SeriesTokenGenerationType.RangeTokenGeneration) {
      series.start_token = 1
    }


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
      time_taken: result.time_taken,
      created_at: result.created_at
    };

    console.log("inMemoryToken", inMemoryToken)
    const tokenManager = new CompanyTokenManager(company.hash_id);
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
        code: language.code
      },
      company: {
        id: company.hash_id,
        name: company.company_name
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
      reason: null

    }
    return response;
  }

  private async validateFormData(seriesId: number, formData: any): Promise<void> {
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
      ].filter(name => name && name.trim() !== '');

      let fieldValue: any = undefined;
      let usedFieldName: string = '';

      for (const fieldName of possibleFieldNames) {
        if (formData.hasOwnProperty(fieldName)) {
          fieldValue = formData[fieldName];
          usedFieldName = fieldName;
          break;
        }
      }

      if (isRequired && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
        const fieldDisplayName = field.field_english_name || field.field_hindi_name || field.field_regional_name;
        errors.push(`Field '${fieldDisplayName}' is required`);
        continue;
      }

      if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
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
          if (typeof fieldValue !== 'number' && !(!isNaN(Number(fieldValue)) && isFinite(Number(fieldValue)))) {
            errors.push(`Field '${usedFieldName}' must be a valid number`);
          }
          break;

        case 'email':
          if (typeof fieldValue !== 'string' || !this.isValidEmail(fieldValue)) {
            errors.push(`Field '${usedFieldName}' must be a valid email address`);
          }
          break;

        case 'phone':
        case 'mobile':
          if (typeof fieldValue !== 'string' || !this.isValidPhone(fieldValue)) {
            errors.push(`Field '${usedFieldName}' must be a valid phone number`);
          }
          break;

        case 'date':
          if (!this.isValidDate(fieldValue)) {
            errors.push(`Field '${usedFieldName}' must be a valid date (YYYY-MM-DD format)`);
          }
          break;

        case 'time':
          if (typeof fieldValue !== 'string' || !this.isValidTime(fieldValue)) {
            errors.push(`Field '${usedFieldName}' must be a valid time (HH:MM format)`);
          }
          break;

        case 'datetime':
          if (!this.isValidDateTime(fieldValue)) {
            errors.push(`Field '${usedFieldName}' must be a valid datetime`);
          }
          break;

        case 'select':
        case 'dropdown':
          if (typeof fieldValue !== 'string' && typeof fieldValue !== 'number') {
            errors.push(`Field '${usedFieldName}' must be a valid selection`);
          }
          break;

        case 'checkbox':
          if (typeof fieldValue !== 'boolean' && fieldValue !== 0 && fieldValue !== 1 && fieldValue !== 'true' && fieldValue !== 'false') {
            errors.push(`Field '${usedFieldName}' must be a valid boolean value`);
          }
          break;

        case 'radio':
          if (typeof fieldValue !== 'string' && typeof fieldValue !== 'number') {
            errors.push(`Field '${usedFieldName}' must be a valid radio selection`);
          }
          break;

        case 'file':
        case 'image':
          if (typeof fieldValue !== 'string') {
            errors.push(`Field '${usedFieldName}' must be a valid file reference`);
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
    inputFields.forEach(field => {
      if (field.field_english_name) allowedFields.push(field.field_english_name);
      if (field.field_hindi_name) allowedFields.push(field.field_hindi_name);
      if (field.field_regional_name) allowedFields.push(field.field_regional_name);
    });
    
    const providedFields = Object.keys(formData);
    const unexpectedFields = providedFields.filter(field => !allowedFields.includes(field));
    
    if (unexpectedFields.length > 0) {
      errors.push(`Unexpected fields provided: ${unexpectedFields.join(', ')}`);
    }

    if (errors.length > 0) {
      throw new HttpBadRequestError(`Form validation failed: ${errors.join(', ')}`);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
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
      id: number,
      settingAppyle: number
    }
  ): Promise<number | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const companySetting = await prisma.ht_company_settings.findFirst({
      where : {
        company_id: companyId,
        deleted_at: null,
      },
      select : {
        id: true,
        hash_id: true,
        series_selection:true,
        series_token_generate_type: true
      }
    })

    let whereClause: any = {
      company_id: companyId,

        token_date: {
          gte: today,
          lt: tomorrow,
        },
        deleted_at: null,
    }
    if(companySetting?.series_selection === SeriesSelection.MULTIPLE){
      throw new Error("this is not implement")
    }
    if(companySetting?.series_token_generate_type !==  SeriesTokenGenerationType.SharedTokenSeries){
      if(series.settingAppyle === 1){

        whereClause.series_id = series.id
      } else {
        const seriesData = await prisma.ht_series.findMany({
          where :{
            comapany_id: companyId,
            is_series_generate_type_apply: 1
          }
        })
        const seriesIds = seriesData.map((data)=> (data.id))
         whereClause.series_id = {
          notIn : seriesIds
        }
        
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