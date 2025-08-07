import { type NextFunction, type Request, type Response } from "express";
import { verifyToken } from "@/utils/verify-jwt-token";
import { UserResponseDto } from "@/modules/process-token/user-auth/dto/current-user-auth.dto";
import AuthService from "@/modules/process-token/user-auth/user-auth.service";
import { UserAuthTokenPayload } from "@/types/common.type";

export const validateProcessTokenAuthUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bearerHeader = req.headers.authorization as string;

    // Check if bearer is undefined
    if (typeof bearerHeader !== "undefined" && bearerHeader !== "") {
      // Split the space at the bearer
      const bearer = bearerHeader.split(" ");
      // Get token from string
      const bearerToken = bearer[1];
      // Verify the token0000000000
      const decodedToken = verifyToken(bearerToken) as UserAuthTokenPayload;

   

      if (!decodedToken?.sub) {
        return res.sendStatus(401);
      }

      const authService = new AuthService();
      const loggedInUser: UserResponseDto | null =
        await authService.getUserDetailsByHashId(
          decodedToken.sub,
          decodedToken.counter_id
        );
      if (!loggedInUser) {
        return res.sendStatus(401); // Unauthorized
      }



      res.locals.currentUser = loggedInUser;
      console.log("Calling next function from auth middleware");
      next(); // Continue to the next middleware or route handler
    } else {
      return res.sendStatus(401); // Unauthorized
    }
  } catch (e) {
    console.log(e);
    return res.sendStatus(401); // Unauthorized on error
  }
};

export const validateProcessTokenAuthSocketUser = async (token: string) => {
  const decodedToken = verifyToken(token) as UserAuthTokenPayload;

  if (!decodedToken?.sub) {
    throw new Error('Unauthorized user');
  }
  const authService = new AuthService();
  const loggedInUser: UserResponseDto | null =
    await authService.getUserDetailsByHashId(decodedToken.sub,decodedToken.counter_id);

  if (loggedInUser === null) {
    throw new Error('Unauthorized user');
  }

  return loggedInUser;
};

