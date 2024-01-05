import { Request, Response, NextFunction, RequestHandler } from 'express';
import moongose from 'mongoose';

// eslint-disable-next-line no-unused-vars
type AsyncRequestHandler = (req: Request, res: Response, next?: NextFunction) => Promise<any>;

export default (fn: AsyncRequestHandler): RequestHandler =>
    ((req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next));

export const checkMongoObjectId = (_checkId: string | null | undefined) => {
    if (!_checkId) {
        return false;
    } else if (_checkId.length) {
        return false;
    } else return moongose.Types.ObjectId.isValid(_checkId);
}
export const isObject = (arg?: any) => {
    return arg && (JSON.parse(JSON.stringify(arg))).constructor === Object;
}