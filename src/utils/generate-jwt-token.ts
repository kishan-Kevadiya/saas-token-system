import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { UserAuthTokenPayload, type TokenPayload } from '../types/common.type';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN as StringValue;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as string;

export const generateJWTToken = (
  payload: TokenPayload | UserAuthTokenPayload
  // | AppointmentTokenPayload
): string => {
  return jwt.sign(payload, JWT_SECRET_KEY, {
    expiresIn: JWT_EXPIRES_IN,
  });
};