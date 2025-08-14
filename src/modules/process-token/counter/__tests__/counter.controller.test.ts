import { HttpStatusCode } from 'axios';
import { Request, NextFunction } from 'express';
import CounterController from '../counter.controller';
import CounterService from '../counter.service';
import { CounterResponseBodyDto } from '../dto/counter.dto';
import { CounterDropDownListDto } from '../dto/counter-dropdown-list.dto';

describe('CounterController', () => {
  let counterServiceMock: jest.Mocked<CounterService>;
  let controller: CounterController;
  let mockReq: Partial<Request>;
  let mockRes: any;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    counterServiceMock = {
      getCounterByCompanyId: jest.fn(),
      counterListForDropDown: jest.fn(),
    } as any;

    controller = new CounterController(counterServiceMock);

    mockReq = {};
    mockRes = {
      locals: {
        currentUser: { company_id: 'company123' },
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    jest.spyOn(controller as any, 'send').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCounterByCompanyId', () => {
    it('should return counter data successfully', async () => {
      const mockCounter: CounterResponseBodyDto = { id: 'counter1', name: 'Counter A' } as any;

      counterServiceMock.getCounterByCompanyId.mockResolvedValueOnce(mockCounter);

      await controller.getCounterByCompanyId(
        mockReq as Request,
        mockRes,
        mockNext
      );

      expect(counterServiceMock.getCounterByCompanyId).toHaveBeenCalledWith(
        mockRes.locals.currentUser
      );
      expect(controller['send']).toHaveBeenCalledWith(
        mockRes,
        mockCounter,
        HttpStatusCode.Ok,
        'Counter data retrieved successfully.'
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Service failed');
      counterServiceMock.getCounterByCompanyId.mockRejectedValueOnce(error);

      await controller.getCounterByCompanyId(
        mockReq as Request,
        mockRes,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('counterListForDropDown', () => {
    it('should return dropdown list successfully', async () => {
      const mockDropDownList: CounterDropDownListDto[] = [
        {
            id: 'hash_id1',
            counter_name: 'counter1',
            counter_no: 1,
        },
        {
            id: 'hash_id2',
            counter_name: 'counter2',
            counter_no: 2,
        },
      ];

      counterServiceMock.counterListForDropDown.mockResolvedValueOnce(mockDropDownList);

      await controller.counterListForDropDown(
        mockReq as Request,
        mockRes,
        mockNext
      );

      expect(counterServiceMock.counterListForDropDown).toHaveBeenCalledWith(
        mockRes.locals.currentUser
      );
      expect(controller['send']).toHaveBeenCalledWith(
        mockRes,
        mockDropDownList,
        HttpStatusCode.Ok,
        'Counter dropdown list get successfully.'
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Service failed');
      counterServiceMock.counterListForDropDown.mockRejectedValueOnce(error);

      await controller.counterListForDropDown(
        mockReq as Request,
        mockRes,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
