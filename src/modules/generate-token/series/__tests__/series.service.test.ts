import SeriesService from '../series.service';
import prisma from '@/lib/prisma';
import { HttpNotFoundError } from '@/lib/errors';

jest.mock('@/lib/prisma', () => ({
  ht_languages: {
    findUnique: jest.fn(),
  },
  ht_series: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  ht_company: {
    findUnique: jest.fn(),
  },
  ht_series_input_fields: {
    findMany: jest.fn(),
  },
}));
const mockCompany = { id: 1 };
const mockLanguage = { name: 'English' };
const mockSeries = [
  {
    hash_id: 'series1',
    series_english_name: 'Series One',
    series_hindi_name: 'सीरीज वन',
    series_regional_name: 'રીજનલ સીરીઝ',
    series_image: 'image.png',
  },
];

describe('SeriesService', () => {
  const service = new SeriesService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTopLevelSeries', () => {
    it('should return top-level series with language-based names', async () => {
      (prisma.ht_company.findUnique as jest.Mock).mockResolvedValue(
        mockCompany
      );
      (prisma.ht_languages.findUnique as jest.Mock).mockResolvedValue(
        mockLanguage
      );
      (prisma.ht_series.findMany as jest.Mock).mockResolvedValue(mockSeries);

      const result = await service.getTopLevelSeries(
        'company_hash',
        'lang_hash'
      );

      expect(result).toEqual([
        {
          id: 'series1',
          series_name: 'Series One',
          series_image: 'image.png',
        },
      ]);
    });

    it('should throw error if company not found', async () => {
      (prisma.ht_company.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getTopLevelSeries('company_hash', 'lang_hash')
      ).rejects.toThrow(HttpNotFoundError);
    });

    it('should throw error if language not found', async () => {
      (prisma.ht_company.findUnique as jest.Mock).mockResolvedValue(
        mockCompany
      );
      (prisma.ht_languages.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getTopLevelSeries('company_hash', 'lang_hash')
      ).rejects.toThrow(HttpNotFoundError);
    });
  });

  describe('getSubSeries', () => {
    const mockParent = {
      id: 1,
      hash_id: 'series1',
      parent_series_id: null,
      display_form: 1,
    };

    const mockChildSeries = [
      {
        hash_id: 'sub1',
        series_english_name: 'Sub Series',
        series_hindi_name: 'उप श्रृंखला',
        series_regional_name: 'સબ સીરીઝ',
        series_image: 'image.png',
        display_form: 0,
      },
    ];

    const mockFormFields = [
      {
        hash_id: 'f1',
        field_english_name: 'Field One',
        field_hindi_name: 'फ़ील्ड एक',
        field_regional_name: 'ફીલ્ડ ૧',
        field_type: 'text',
        is_required: 1,
      },
    ];

    it('should return sub-series data when sub-series are present', async () => {
      (prisma.ht_series.findUnique as jest.Mock).mockResolvedValue(mockParent);
      (prisma.ht_languages.findUnique as jest.Mock).mockResolvedValue(
        mockLanguage
      );
      (prisma.ht_series.findMany as jest.Mock).mockResolvedValue(
        mockChildSeries
      );

      const result = await service.getSubSeries('series_hash', 'lang_hash');

      expect(result.sub_series_present).toBe(true);
      expect(result.series?.[0].series_name).toBe('Sub Series');
    });

    it('should return form data if no sub-series but form should be displayed', async () => {
      (prisma.ht_series.findUnique as jest.Mock).mockResolvedValue(mockParent);
      (prisma.ht_languages.findUnique as jest.Mock).mockResolvedValue(
        mockLanguage
      );
      (prisma.ht_series.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.ht_series_input_fields.findMany as jest.Mock).mockResolvedValue(
        mockFormFields
      );

      const result = await service.getSubSeries('series_hash', 'lang_hash');

      expect(result.sub_series_present).toBe(false);
      expect(result.display_form).toBe(1);
      expect(result.form_data?.[0].field_name).toBe('Field One');
    });

    it('should return no form if display_form is 0 and no sub-series', async () => {
      const parentWithoutForm = { ...mockParent, display_form: 0 };
      (prisma.ht_series.findUnique as jest.Mock).mockResolvedValue(
        parentWithoutForm
      );
      (prisma.ht_languages.findUnique as jest.Mock).mockResolvedValue(
        mockLanguage
      );
      (prisma.ht_series.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getSubSeries('series_hash', 'lang_hash');

      expect(result.sub_series_present).toBe(false);
      expect(result.form_data).toBeNull();
      expect(result.display_form).toBe(0);
    });

    it('should throw if parent series not found', async () => {
      (prisma.ht_series.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getSubSeries('series_hash', 'lang_hash')
      ).rejects.toThrow(HttpNotFoundError);
    });

    it('should throw if language not found', async () => {
      (prisma.ht_series.findUnique as jest.Mock).mockResolvedValue(mockParent);
      (prisma.ht_languages.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getSubSeries('series_hash', 'lang_hash')
      ).rejects.toThrow(HttpNotFoundError);
    });
  });
});
