import { type Request, type NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
import LanguageService from './language.service';
import { type GenerateTokenlanguageDto } from './dto/language.dto';
import Api from '@/lib/api';
import { type CustomResponse } from '@/types/common.type';

export default class LanguageController extends Api {
  private readonly languageService: LanguageService;

  constructor(languageService?: LanguageService) {
    super();
    this.languageService = languageService ?? new LanguageService();
  }

  public getLanguages = async (
    req: Request,
    res: CustomResponse<GenerateTokenlanguageDto[]>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const languages = await this.languageService.getLanguagesByCompanyId(
        req.params.company_id
      );

      this.send(
        res,
        languages,
        HttpStatusCode.Ok,
        'Languages retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  };
}
