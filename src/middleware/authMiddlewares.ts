import * as _ from 'lodash';
import asyncHandler from '../utils/async_handle';
import { extractToken } from '../utils/helpers';
import { ForbiddenError, UnauthorizedError } from '../common/errors';
import { jwtDecodeToken, jwtEncode } from '../utils/jwtToken';
import { UserModel } from '../database/users';
import { UserInfo } from '../submodule/models/user';

export const generateAccessToken = (data: any) => {
  return jwtEncode(data)
}

export const generateRefreshToken = (data: any) => {
  return jwtEncode(data)
}

export const authMiddleware = asyncHandler(async (req: any, res, next: any) => {
  const token = extractToken(req.headers.authorization || "")
  if (!token) {
    return next(new UnauthorizedError('Token Invalid'));
    // throw res.json(new UnauthorizedError('Token Invalid'));
    // throw res.status(401).json({
    //   "status": 401,
    //   "message": token,
    //   "custom": "custom message"
    // });
  }
    
  const decode = jwtDecodeToken(token);
  if (typeof decode === 'object' && decode !== null && '_id' in decode) {
    const currentUser = await UserModel.findById(decode._id);
    if (!currentUser)
      return next(
        new UnauthorizedError(
          'the user belonging to this token does no longer exist.'
        )
      );

    // 4) check  if user change password after the token was issued
    // trong db lưu 1 trường passwordChangeAt, so sánh với iat của token.
    // Nếu tgian password thay đổi lớn hơn ngày tạo token thì login lại.
    // if (currentUser.passwordChangeAt > decode.iat * 1000)
    //   return next(
    //     new UnauthorizedError(
    //       'User recently changed password! Please login again'
    //     )
    //   );
    // GRANT ACCESS TO  PROTECTED ROUTE

    req.user = currentUser;
  } else {
    return next(new UnauthorizedError('Token Expired'));
  }
  next();
});

export const isAdmin = asyncHandler(async (req: any, res, next: any) => {
  const { email } = req.user;
  const adminUser = new UserInfo(await UserModel.findOne({ email }));
  if (adminUser.userRole !== 0) {
    return next(new ForbiddenError());
  } else {
    next();
  }
});