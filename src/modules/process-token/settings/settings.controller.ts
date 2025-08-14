import { type Request, type NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
import SettingsService from './settings.service';
import { type SettingsDto } from './dto/settings.dto';
import { type CustomResponse } from '@/types/common.type';
import Api from '@/lib/api';

export default class SettingsController extends Api {
  private readonly settingsService: SettingsService;

  constructor(settingsService?: SettingsService) {
    super();
    this.settingsService = settingsService ?? new SettingsService();
  }

  public getSettings = async (
    req: Request,
    res: CustomResponse<SettingsDto>,
    _next: NextFunction
  ) => {
    try {
      const settings = await this.settingsService.getSettings(
        res.locals.currentUser
      );

      this.send(res, settings, HttpStatusCode.Ok, 'Settings get sucessfully.');
    } catch (e) {
      _next(e);
    }
  };
}
