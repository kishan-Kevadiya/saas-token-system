import { HttpStatusCode } from 'axios';
import DepartmentController from '../department.controller';
import type DepartmentService from '../department.service';

describe('DepartmentController', () => {
  let controller: DepartmentController;
  let mockService: jest.Mocked<DepartmentService>;
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    mockService = {
      getDepartment: jest.fn(),
    } as unknown as jest.Mocked<DepartmentService>;

    controller = new DepartmentController(mockService);

    req = {};
    res = {
      locals: {
        currentUser: { id: 1, company: { id: 10 }, name: 'Test User' },
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    (controller as any).send = jest.fn();

    next = jest.fn();
  });

  it('should return department successfully', async () => {
    const mockDepartments = [
      {
        id: 'dep_1',
        name: 'Engineering',
        created_at: '2023-08-01T12:00:00.000Z',
      },
    ];

    mockService.getDepartment.mockResolvedValue(mockDepartments);

    await controller.getDepartment(req, res, next);

    expect(mockService.getDepartment).toHaveBeenCalledWith(
      res.locals.currentUser
    );

    expect((controller as any).send).toHaveBeenCalledWith(
      res,
      mockDepartments,
      HttpStatusCode.Ok,
      'Department get sucessfully.'
    );
  });
  it('should handle unexpected errors', async () => {
    const error = new Error('Service failed');
    mockService.getDepartment.mockRejectedValueOnce(error);

    await controller.getDepartment(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
