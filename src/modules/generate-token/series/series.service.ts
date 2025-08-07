import {
  type FormFieldDto,
  type GenerateTokenSeriesDto,
  type GenerateTokenSubSeriesResponseDto,
} from './dto/series.dto';
import { HttpNotFoundError } from '@/lib/errors';
import prisma from '@/lib/prisma';

export default class SeriesService {
  public getTopLevelSeries = async (
    companyId: string,
    langaugeId: string
  ): Promise<GenerateTokenSeriesDto[]> => {
    const [company, language] = await Promise.all([
      prisma.ht_company.findUnique({
        where: {
          hash_id: companyId,
          deleted_at: null,
        },
        select: { id: true },
      }),
      prisma.ht_languages.findUnique({
        where: {
          hash_id: langaugeId,
          deleted_at: null,
        },
      }),
    ]);

    if (!company) {
      throw new HttpNotFoundError('Company not found');
    }

    if (!language) {
      throw new HttpNotFoundError('Language not found');
    }

    const series = await prisma.ht_series.findMany({
      where: {
        comapany_id: company.id,
        deleted_at: null,
        parent_series_id: null,
        is_active: 1,
      },
      select: {
        hash_id: true,
        series_english_name: true,
        series_hindi_name: true,
        series_regional_name: true,
        series_image: true,
      },
    });

    return series.map(
      (item): GenerateTokenSeriesDto => ({
        id: item.hash_id,
        series_name: item[this.getLanguageField(language.name)],
        series_image: item.series_image ?? null,
      })
    );
  };

  public getSubSeries = async (
    seriesId: string,
    langaugeId: string
  ): Promise<GenerateTokenSubSeriesResponseDto> => {
    const [parentSeries, language] = await Promise.all([
      prisma.ht_series.findUnique({
        where: {
          hash_id: seriesId,
          deleted_at: null,
          is_active: 1,
        },
        select: {
          id: true,
          hash_id: true,
          parent_series_id: true,
          display_form: true,
        },
      }),
      prisma.ht_languages.findUnique({
        where: {
          hash_id: langaugeId,
          deleted_at: null,
        },
      }),
    ]);

    if (!parentSeries) {
      throw new HttpNotFoundError('Parent series not found');
    }
    if (!language) {
      throw new HttpNotFoundError('Language not found');
    }

    const subSeries = await this.getChildSeries(parentSeries.id);

    if (subSeries.length === 0) {
      return await this.handleNoSubSeries(parentSeries, language);
    }

    return this.buildSubSeriesResponse(parentSeries, subSeries, language);
  };

  private readonly getChildSeries = async (parentSeriesId: number) => {
    return await prisma.ht_series.findMany({
      where: {
        parent_series_id: parentSeriesId,
        deleted_at: null,
        is_active: 1,
      },
      select: {
        hash_id: true,
        series_english_name: true,
        series_hindi_name: true,
        series_regional_name: true,
        series_image: true,
        display_form: true,
      },
    });
  };

  private async getFormFields(
    seriesId: number,
    language
  ): Promise<FormFieldDto[]> {
    const formFields = await prisma.ht_series_input_fields.findMany({
      where: {
        series_id: seriesId,
        deleted_at: null,
      },
      select: {
        hash_id: true,
        field_english_name: true,
        field_hindi_name: true,
        field_regional_name: true,
        field_type: true,
        is_required: true,
      },
    });

    return formFields.map(
      (field): FormFieldDto => ({
        id: field.hash_id,
        field_name: field[this.getLanguageFormField(language.name)],
        field_type: field.field_type,
        is_required: field.is_required,
      })
    );
  }

  private async handleNoSubSeries(
    parentSeries,
    language
  ): Promise<GenerateTokenSubSeriesResponseDto> {
    if (parentSeries.display_form === 1) {
      const formData = await this.getFormFields(parentSeries.id, language);
      return {
        id: parentSeries.hash_id,
        sub_series_present: false,
        display_form: 1,
        form_data: formData,
        series: null,
      };
    }

    return {
      id: parentSeries.hash_id,
      sub_series_present: false,
      display_form: 0,
      form_data: null,
      series: null,
    };
  }

  private buildSubSeriesResponse(
    parentSeries: any,
    subSeries: any[],
    language: any
  ): GenerateTokenSubSeriesResponseDto {
    const seriesData: GenerateTokenSeriesDto[] = subSeries.map(
      (data): GenerateTokenSeriesDto => ({
        id: data.hash_id,
        series_name: data[this.getLanguageField(language.name)],
        series_image: data.series_image,
        display_form: data.display_form,
      })
    );

    return {
      id: parentSeries.hash_id,
      sub_series_present: true,
      display_form: parentSeries.display_form,
      form_data: null,
      series: seriesData,
    };
  }

  private getLanguageField(
    language: string
  ): 'series_english_name' | 'series_hindi_name' | 'series_regional_name' {
    const name = language.toLowerCase();
    if (name === 'english') return 'series_english_name';
    if (name === 'hindi') return 'series_hindi_name';
    return 'series_regional_name';
  }

  private getLanguageFormField(
    language: string
  ): 'field_english_name' | 'field_hindi_name' | 'field_regional_name' {
    const name = language.toLowerCase();
    if (name === 'english') return 'field_english_name';
    if (name === 'hindi') return 'field_hindi_name';
    return 'field_regional_name';
  }
}
