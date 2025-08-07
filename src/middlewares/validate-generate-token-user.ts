import { type NextFunction, type Request, type Response } from 'express';
import AuthService from '@/modules/process-token/company-auth/auth.service';
import { type CurrentUserDto } from '@/modules/process-token/company-auth/dto/current-user.dto';
import { verifyToken } from '@/utils/verify-jwt-token';

export const validateGenerateTokenUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bearerHeader = req.headers.authorization as string;

    // Check if bearer is undefined
    if (typeof bearerHeader !== 'undefined' && bearerHeader !== '') {
      // Split the space at the bearer
      const bearer = bearerHeader.split(' ');
      // Get token from string
      const bearerToken = bearer[1];
      // Verify the token
      const decodedToken = verifyToken(bearerToken);

      if (!decodedToken?.sub) {
        return res.sendStatus(401); // Unauthorized
      }

      const authService = new AuthService();
      const loggedInUser: CurrentUserDto | null =
        await authService.getUserDetailsByHashId(decodedToken.sub);
      if (!loggedInUser) {
        return res.sendStatus(401); // Unauthorized
      }


      res.locals.currentUser = loggedInUser;
      console.log('Calling next function from auth middleware');
      next(); // Continue to the next middleware or route handler
    } else {
      return res.sendStatus(401); // Unauthorized
    }
  } catch (e) {
    console.log(e);
    return res.sendStatus(401); // Unauthorized on error
  }
};

export const validateGenerateSocketTokenUser = async (token: string) => {
  const decodedToken = verifyToken(token);

  console.log("decodedToken", decodedToken)
  if (!decodedToken?.sub) {
    throw new Error('Unauthorized user');
  }
  const authService = new AuthService();
  const loggedInUser: CurrentUserDto | null =
    await authService.getUserDetailsByHashId(decodedToken.sub,);

  if (loggedInUser === null) {
    throw new Error('Unauthorized user');
  }

  return loggedInUser;
};
