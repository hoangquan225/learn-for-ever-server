import express from 'express';
import { AuthServices } from '../../services/auth';
import asyncHandler from '../../utils/async_handle';
import { UserInfo } from '../../submodule/models/user';
import { isValidEmail } from "../../submodule/utils/validation";
import { BadRequestError } from '../../common/errors';
import TTCSconfig from '../../submodule/common/config';
import { getCookieOptions } from '../../utils/cookie';
import Endpoint from '../../submodule/common/endpoint';

const authRouter = express.Router();

const authService = new AuthServices();
authRouter.post(Endpoint.LOGIN, asyncHandler(async (req, res) => {
    const body: { account: string, password: string, userRole?:number } = req.body;
    if (!body.account || !body.password) {
        throw res.json(new BadRequestError('invalid account or password'));
    } else {
        const { loginCode, token, ...userLogin } = await authService.login(body);
        return res.json({
            loginCode,
            userLogin,
            token
        });
    }
}));
authRouter.post(Endpoint.LOGOUT, asyncHandler(async (req, res) => {
    const { status } = await authService.logout(req.body);
    return res.json({
        status
    })
}));

authRouter.post(Endpoint.REGISTER, asyncHandler(async (req, res) => {
    const body = <UserInfo>req.body;

    if (!body.account || !body.password) throw res.json(new BadRequestError('invalid account or password'));
    if (!isValidEmail(body?.email || '')) throw res.json(new BadRequestError('invalid email'));

    const { loginCode, token, ...registerData } = await authService.register(body);

    // if (loginCode === TTCSconfig.LOGIN_SUCCESS) {
    //     res.cookie('token', token, { ...getCookieOptions() });
    // }

    return res.json({ loginCode, info: registerData, token });
}));


authRouter.post(Endpoint.LOGIN_WITH_GOOGLE, asyncHandler(async (req, res) => {
    const body = req.body;

    const { loginCode, token, ...userInfo } = await authService.loginWithGoogle(body);
    return res.json({
        loginCode,
        userInfo,
        token
    });
}));

export { authRouter };

