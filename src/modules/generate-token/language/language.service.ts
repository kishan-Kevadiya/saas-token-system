import { type GenerateTokenlanguageDto } from './dto/language.dto';
import { HttpNotFoundError } from '@/lib/errors';
import prisma from '@/lib/prisma';

export default class LanguageService {
  public async getLanguagesByCompanyId(
    hashId: string
  ): Promise<GenerateTokenlanguageDto[]> {
    const company = await prisma.ht_company.findUnique({
      where: {
        hash_id: hashId,
        deleted_at: null,
      },
      select: {
        id: true,
      },
    });

    if (!company) {
      throw new HttpNotFoundError('Company not found');
    }

    const languages = await prisma.ht_company_languages.findMany({
      where: {
        company_id: company.id,
        deleted_at: null,
      },
      select: {
        hash_id: true,
        languages: {
          select: {
            hash_id: true,
            name: true,
            code: true,
            title: true,
          },
        },
      },
      orderBy: {
        languages: {
          name: 'asc',
        },
      },
    });
    if (languages.length === 0) {
      throw new HttpNotFoundError('No languages found for this company');
    }

    return this.mapLanguagesToDto(languages);
  }

  private mapLanguagesToDto(languages: any[]): GenerateTokenlanguageDto[] {
    return languages.map((language) => ({
      id: language.languages.hash_id,
      name: language.languages.name,
      code: language.languages.code,
      title: language.languages.title,
    }));
  }
}
