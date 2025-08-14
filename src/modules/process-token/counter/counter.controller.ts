import { HttpStatusCode } from 'axios';
import { type NextFunction, type Request } from 'express';
import CounterService from './counter.service';
import { type CounterResponseBodyDto } from './dto/counter.dto';
import Api from '@/lib/api';
import { type CustomResponse } from '@/types/common.type';
import { CounterDropDownListDto } from './dto/counter-dropdown-list.dto';

export default class CounterController extends Api {
  private readonly counterService: CounterService;

  constructor(counterService?: CounterService) {
    super();
    this.counterService = counterService ?? new CounterService();
  }

  public getCounterByCompanyId = async (
    req: Request,
    res: CustomResponse<CounterResponseBodyDto>,
    _next: NextFunction
  ) => {
    try {
      const counter = await this.counterService.getCounterByCompanyId(
        res.locals.currentUser
      );
      this.send(
        res,
        counter,
        HttpStatusCode.Ok,
        'Counter data retrieved successfully.'
      );
    } catch (e) {
      _next(e);
    }
  };

  public counterListForDropDown = async (
    req: Request,
    res: CustomResponse<CounterDropDownListDto[]>,
    _next: NextFunction
  ) => {
    try {
      const counterDropDownList =
        await this.counterService.counterListForDropDown(
          res.locals.currentUser
        );
      this.send(
        res,
        counterDropDownList,
        HttpStatusCode.Ok,
        'Counter dropdown list get successfully.'
      );
    } catch (e) {
      _next(e);
    }
  };
}
