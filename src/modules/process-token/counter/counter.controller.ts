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
      console.log('res.locals.currentUser :>> ', res.locals.currentUser);
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
      console.log('e :>> ', e);
      if (e.message === 'No ht_company found') {
        this.send(res, null, HttpStatusCode.NotFound, 'Company not found!');
      } else {
        this.send(
          res,
          null,
          HttpStatusCode.InternalServerError,
          'An unexpected error occurred'
        );
      }
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
        this.send(
          res,
          null,
          HttpStatusCode.InternalServerError,
          'An unexpected error occurred',
          );
      }
    };
}
