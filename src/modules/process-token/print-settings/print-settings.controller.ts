import { type Request, type NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
import { type CustomResponse } from '@/types/common.type';
import Api from '@/lib/api';
import PrintSettingsService from './print-settings.service';
import { PrintSettingsDto } from './dto/print-settings.dto';

export default class PrintSettingsController extends Api {
  private readonly printSettingsService: PrintSettingsService;

  constructor(printSettingsService?: PrintSettingsService) {
    super();
    this.printSettingsService =
      printSettingsService ?? new PrintSettingsService();
  }

  public getPrintSettings = async (
    req: Request,
    res: CustomResponse<PrintSettingsDto>,
    _next: NextFunction
  ) => {
    try {
      const printSettings = await this.printSettingsService.getPrintSettings(
        res.locals.currentUser
      );

      this.send(
        res,
        printSettings,
        HttpStatusCode.Ok,
        'Print settings get sucessfully.'
      );
    } catch (e) {
      _next(e);
    }
  };
}
