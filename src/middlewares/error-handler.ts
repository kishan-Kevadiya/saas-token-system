import util from 'util';
import { type NextFunction, type Request, type Response } from 'express';
import { HttpStatusCode } from 'axios';
import { type ApiError } from '@/lib/errors';
import logger from '@/lib/logger';
import environment from '@/lib/environment';

interface ErrorBody {
  success: false;
  message: string;
  rawErrors?: string[];
  stack?: string;
}

const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Request Error:
        \nError:\n${JSON.stringify(err)}
        \nHeaders:\n${util.inspect(req.headers)}
        \nParams:\n${util.inspect(req.params)}
        \nQuery:\n${util.inspect(req.query)}
        \nBody:\n${util.inspect(req.body)}`);

  const status: number = err.statusCode ?? HttpStatusCode.InternalServerError;
  if (status === HttpStatusCode.InternalServerError) {
    console.log(err);
    err.message = 'An unexpected error occurred';
  }

  const errorBody: ErrorBody = {
    success: false,
    message: err.message,
  };

  if (environment.isDev()) {
    errorBody.rawErrors = err.rawErrors;
    errorBody.stack = err.stack;
  }

  res.status(status).send(errorBody);
};

export default errorHandler;
