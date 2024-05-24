import { Express, Request, Response, NextFunction } from 'express';
import { jwtDecodeToken } from '../../utils/jwtToken';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { BadRequestError } from '../../common/errors';

export const jwtMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.body as { token: string };
        if (!token) return res.status(401).json({})
        const decode = jwtDecodeToken(token);
        if (!decode || typeof decode === "string") return res.status(401).json({});
        req.body._id = decode._id

        next();

    } catch (error) {
        if (error instanceof JsonWebTokenError) {
            if (error instanceof TokenExpiredError) {
                return res.status(401).json({ data: -1 }); // token het han
            }
        }
        throw new BadRequestError();
    }
}