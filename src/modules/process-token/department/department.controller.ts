import { HttpStatusCode } from 'axios';
import { type Request, type NextFunction } from 'express';
import DepartmentService from './department.service';
import { type DepartmentDto } from './dto/department.dto';
import { type CustomResponse } from '@/types/common.type';
import Api from '@/lib/api';

export default class DepartmentController extends Api {
  private readonly departmentService: DepartmentService;

  constructor(departmentService?: DepartmentService) {
    super();
    this.departmentService = departmentService ?? new DepartmentService();
  }

  public getDepartment = async (
    req: Request,
    res: CustomResponse<DepartmentDto>,
    _next: NextFunction
  ) => {
    try {
      const department = await this.departmentService.getDepartment(
        res.locals.currentUser
      );

      this.send(
        res,
        department,
        HttpStatusCode.Ok,
        'Department get sucessfully.'
      );
    } catch (e) {
      _next(e)
    }
  };
}
