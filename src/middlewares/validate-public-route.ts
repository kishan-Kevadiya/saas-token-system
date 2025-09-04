import { type NextFunction, type Request, type Response } from 'express';

export const verifyPublicRouteToken = async (
    _req: Request,
    _res: Response,
    next: NextFunction
) => {
    const token = _req.headers["authorization"];
    if (!token || token.split(' ')[1] !== process.env.PUBLIC_ROUTE_SECRET) {
        return _res.status(401).json({ message: "Unauthorized" });
    }

    next();
};
