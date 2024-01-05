import Endpoint from '../submodule/common/endpoint';
import express from 'express';
import asyncHandler from '../utils/async_handle';
import { UserInfo } from '../submodule/models/user';
import UserService from '../services/user';
import { isValidObjectId } from 'mongoose';
import { BadRequestError } from '../common/errors';
import { extractToken } from '../utils/helpers';

const userRouter = express.Router();
const userService = new UserService();

userRouter.post(Endpoint.UPDATE_USER, asyncHandler(async (req, res) => {
    const body: { token: string, userInfo: UserInfo } = req.body;

    if (!body.token ) {
        throw res.json(new BadRequestError('invalid info'));
    } else {
        const { status, userInfo } = await userService.updateUserInfo(body);
        return res.json({
            status,
            userInfo,
        });
    }
}));

userRouter.post(Endpoint.GET_USER_FROM_TOKEN, asyncHandler(async (req, res) => {
    // const { token } = <{ token: string }>req.body;
    const token = extractToken(req.headers.authorization || "")
    const users = await userService.checkUserFromToken(token);
    return res.json(users);
}));

userRouter.post(Endpoint.CHANGE_PASSWORD, asyncHandler(async (req, res) => {
    const body: { token: string, password: string, newPassword: string } = req.body;

    if (!body.password || !body.newPassword) {
        throw res.json(new BadRequestError('invalid newPassword or password'));
    } else {
        const { loginCode, ...UserInfo } = await userService.changePassword(body);
        return res.json({
            loginCode,
            UserInfo,
        });
    }
}));

userRouter.post(Endpoint.GET_TOTAL_LEARNED_TOPIC, asyncHandler(async (req, res) => {
    const data = await userService.getTotalLearnedTopic(req.body)
    return res.json(data)
}))

userRouter.post(Endpoint.UPDATE_STUDYED_FOR_USER, asyncHandler(async (req, res) => {
    const data = await userService.updateStudyedForUser(req.body)
    return res.json(data)
}))

export { userRouter };
