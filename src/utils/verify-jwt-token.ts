import jwt from 'jsonwebtoken';
import {
  UserAuthTokenPayload,
  type TokenPayload,
} from '../types/common.type';

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as string;

export const verifyToken = (
  token: string
): TokenPayload | null | UserAuthTokenPayload => {
  const decoded = jwt.verify(token, JWT_SECRET_KEY) as
    | TokenPayload
  return decoded;
};
