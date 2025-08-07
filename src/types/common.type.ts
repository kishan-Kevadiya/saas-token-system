import { type Response } from 'express';

type Send<ResBody = any, T = Response<ResBody>> = (body?: {
  message: string;
  data: ResBody;
}) => T;

export interface CustomResponse<T> extends Response {
  json: Send<T, this>;
}

export interface TokenPayload {
  sub: string; // user hash id
  asccode: string;
}

export interface UserAuthTokenPayload {
  sub: string;
  username: string;
  counter_id: string
}
