import TTCSconfig from "../submodule/common/config";
import { UserInfo } from "../submodule/models/user";
import { UserModel } from "../database/users";
import { decrypt, encodeSHA256Pass, encrypt } from "../submodule/utils/crypto";
import { jwtDecodeToken, jwtEncode } from "../utils/jwtToken";
import moment from "moment";
import e from "express";
import sendEmail from "../utils/sendEmail";

class AuthServices {
    private processPass(userObject: {
        account: string;
        password: string;
    }) {
        const decryptedResult = decrypt(userObject.password);
        const encodedPassword = encodeSHA256Pass(userObject.account, decryptedResult);
        return encodedPassword;
    }
    private createToken(user: UserInfo) {
        let userInfo = new UserInfo(user);
        userInfo.loginCode = TTCSconfig.LOGIN_SUCCESS;
        userInfo.token = jwtEncode(userInfo?._id, 60 * 60 * 24 * 30);
        return userInfo
    }
    login = async (body: { account: string, password: string, userRole?: number }): Promise<UserInfo> => {
        const passEncode = this.processPass(body);
        let userInfo = new UserInfo({ ...body, password: body.password });
        try {
            const checkUserAcc: UserInfo | null = await UserModel.findOne(typeof body.userRole === 'number' ? {account: userInfo.account, userRole: body.userRole} : { account: userInfo.account, status: 1 });
            if (checkUserAcc) {
                if (passEncode === checkUserAcc.password) {
                    userInfo = new UserInfo(checkUserAcc);
                    userInfo.loginCode = TTCSconfig.LOGIN_SUCCESS;
                    userInfo.token = jwtEncode(userInfo?._id, 60*60*24*30);
                    // update lastLogin
                } else {
                    userInfo.loginCode = TTCSconfig.LOGIN_WRONG_PASSWORD;
                }
            } else {
                userInfo.loginCode = TTCSconfig.LOGIN_ACCOUNT_NOT_EXIST;
            }
            return userInfo
        } catch (error) {
            userInfo.loginCode = TTCSconfig.LOGIN_FAILED;
            return userInfo
        }
    }
    register = async (body: UserInfo): Promise<any> => {
        let userInfo = new UserInfo(body);
        try {
            const account = userInfo.account?.trim().toLowerCase();
            const password = userInfo.password;
            const email = userInfo.email;
            const checkUserEmail: UserInfo | null = await UserModel.findOne({ email });
            if (checkUserEmail) {
                return { ...userInfo, loginCode: TTCSconfig.LOGIN_EMAIL_IS_USED };
            }
            const checkUserAcc: UserInfo | null = await UserModel.findOne({ account });
            if (!checkUserAcc) {
                const passEncode = this.processPass({ account, password })

                // luu vao db
                const newUserInfo = {
                    ...userInfo,
                    password: passEncode,
                    registerDate: Date.now(),
                    status: TTCSconfig.STATUS_PUBLIC,
                    lastLogin: Date.now()
                }
                const newUser = await UserModel.create(newUserInfo)
                return this.createToken(newUser)
            }
            return { ...userInfo, loginCode: TTCSconfig.LOGIN_ACCOUNT_IS_USED }
        } catch (err) {
            userInfo.loginCode = TTCSconfig.LOGIN_FAILED;
        }
    }

    loginWithGoogle = async (body: UserInfo): Promise<any> => {
        let userInfo = new UserInfo(body);
        try {
            // const account = userInfo.account?.trim().toLowerCase();
            const googleId = userInfo.googleId;
            const email = userInfo.email;

            const checkUserAcc: UserInfo | null = await UserModel.findOne({ googleId });
            if (!checkUserAcc) {
                // check email exits
                const checkUserEmail: UserInfo | null = await UserModel.findOne({ email  });
                if (checkUserEmail) {
                    return { ...userInfo, loginCode: TTCSconfig.LOGIN_EMAIL_IS_USED };
                }

                // luu vao db
                const newUserInfo = {
                    ...userInfo,
                    registerDate: Date.now(),
                    status: TTCSconfig.UserStatus.NORMAL,
                    lastLogin: Date.now()
                }
                const newUser = await UserModel.create(newUserInfo)
                return this.createToken(newUser)
            } else {
                return this.createToken(checkUserAcc)
            }
        } catch (err) {
            userInfo.loginCode = TTCSconfig.LOGIN_FAILED;
        }
    }
    // logout =async (token:string) => {
    //     const tokenData = jwtDecodeToken(token);
    //     if (!!token && typeof tokenData !== "string") {
    //     const _tokenData = (tokenData as any) as TokenData;
    //     const { _id, iat, exp } = _tokenData;
    //     const tokenKey = `${REVOKED_TOKEN_KEY}${iat}_${_id}`;
    //     const time = Math.abs(moment().diff(exp! * 1000, "seconds"));
    //     userCacheClient.setex(tokenKey, time, token);
    //     }
    // }

    logout = async (body: {idUser: string}) => {
        try {
            const user = await UserModel.findOne({_id: body.idUser})
            let status = TTCSconfig.STATUS_FAIL
            if(user) {
                const userInfo = new UserInfo(user)
                const res = await UserModel.findOneAndUpdate(
                    { _id: body.idUser },
                    {  $set: { lastLogin: moment().valueOf() }}, 
                    { new: true }
                )
                return {status: TTCSconfig.STATUS_SUCCESS}
            }
            return {status}
        } catch (error) {
            return {status:TTCSconfig.STATUS_FAIL}
        }
    }

    forgotPassword = async (body) => {
        const user = await UserModel.findOne({ email: body.email });
        if (!user) {
            return {
                data: null,
                message: "Email not exits",
                status: TTCSconfig.STATUS_FAIL
            };
        }
        const tokenExpires = 10*60;
        const resetToken = jwtEncode(user?._id, tokenExpires); 
        const resetURl = `http://localhost:3002/reset-password/${resetToken}`;
        // const resetURl = `http://localhost:3002/reset-password?token=${resetToken}`;
        const html = 
        `
            <div>
                <h1 style="text-align: center">CÀI LẠI MẬT KHẨU?</h1>
                <p>Hi, ${user.name}</p>
                <p>Đừng lo lắng, bạn có thể cài lại mật khẩu bằng cách nhấn vào đường dẫn dưới đây!</p>
                <a href="${resetURl}" 
                    target="_blank" 
                    style="
                        text-decoration: none !important;
                        padding: 16px;
                        background-color: #009d9d;
                        color: #fff;
                        display: block;
                        max-width: 175px;
                        margin: 0 auto;
                        border-radius: 7px;
                        font-family: sans-serif;
                        font-weight: bold;
                        font-size: 18px;
                        text-align: center;"
                >
                    Reset Password
                </a>
                <p>Mã đặt lại mật khẩu của bạn có hiệu lực trong 10 phút, Không chia sẻ nó với bất kỳ ai.</p>
                <p>Nếu bạn không gửi yêu cầu cài lại mật khẩu, hãy bỏ qua email này, hoặc xóa nó. Chúc bạn có một trải nghiệm học tập tốt với Học thông minh</p>
            </div>
        `;

        try {
            await sendEmail(
              user.email,
              '[Elearning] Reset password',
              html
            );
            user.passwordResetExpires = Date.now() + tokenExpires * 1000;
            await user.save({validateBeforeSave: false});
            return {
                data: resetToken,
                message: "Thành công, Vui lòng kiểm tra email của bạn",
                status: TTCSconfig.STATUS_SUCCESS
            }
        } catch (error) {
            user.passwordResetExpires = 0;
            await user.save({validateBeforeSave: false});
            return {
                data: null,
                message: "Đã xảy ra lỗi khi gửi email. Thử lại sau!",
                status: TTCSconfig.STATUS_SUCCESS
            }
        }
    }

    checkTokenExpires = async (body) => {
        try {
            const { token } = body;
            if (!token) {
                return {
                    status: TTCSconfig.STATUS_FAIL,
                    message: "Liên kết đã hết hạn! Vui lòng chọn 'Quên mật khẩu lại'",
                    data: false
                };
            }
            const decode = jwtDecodeToken(token);
            if (typeof decode === 'object' && decode !== null && '_id' in decode) {
                const currentUser = await UserModel.findOne({_id: decode._id, passwordResetExpires: { $gt: Date.now() } });
                if (!currentUser) {
                    return {
                        status: TTCSconfig.STATUS_FAIL,
                        message: "Liên kết đã được sử dụng đổi mật khẩu trước đó",
                        data: false
                    };
                }
                return {
                    status: TTCSconfig.STATUS_SUCCESS,
                    message: "Thành công",
                    data: true
                };
            } else {
                return {
                    status: TTCSconfig.STATUS_FAIL,
                    message: "Liên kết đã hết hạn! Vui lòng chọn 'Quên mật khẩu lại'",
                    data: false
                };
            }
        } catch (error) {
            return {
                status: TTCSconfig.STATUS_FAIL,
                data: false,
                message: "Hệ thống xảy ra xử cố, vui lòng thử lại sau",
            };
        }
    }

    resetPassword = async (body) => {
        try {
            const { token, newPassword } = body;
            if (!token) {
                return {
                    status: TTCSconfig.STATUS_FAIL,
                    message: "Liên kết đã hết hạn",
                    data: token
                };
            }
            const decode = jwtDecodeToken(token);
            if (typeof decode === 'object' && decode !== null && '_id' in decode) {
                const currentUser = await UserModel.findById(decode._id);
                if (!currentUser) {
                    return {
                        status: TTCSconfig.STATUS_FAIL,
                        message: "Tài khoản của bạn không tồn tài hoặc đã bị khóa. Vui lòng liên hệ quản trị viên.",
                        data: token
                    };
                }
                // const newPasswordEncode = this.processPass({ account: currentUser?.account, password: newPassword });
                const newPasswordEncode = encodeSHA256Pass(currentUser.account, newPassword);
                const userUpdatePassword = await UserModel.findOneAndUpdate(
                    {
                        _id: decode._id,
                        passwordResetExpires: { $gt: Date.now() },
                    },
                    {
                      $set: {
                        password: newPasswordEncode,
                        passwordResetExpires: 0
                      },
                    },
                    { new: true }
                );
                if (userUpdatePassword) {
                    return {
                        status: TTCSconfig.STATUS_SUCCESS,
                        data: userUpdatePassword,
                        message: "Thay đổi mật khẩu thành công, Vui lòng đăng nhập lại!",
                    };
                } else {
                    return {
                        status: TTCSconfig.STATUS_FAIL,
                        message: "Mã token đã hết hạn hoặc bạn đã cập nhật mật khẩu trước đó!",
                        data: null
                    };
                }
            } else {
                return {
                    status: TTCSconfig.STATUS_FAIL,
                    message: "Mã token đã hết hạn hoặc bạn đã cập nhật mật khẩu trước đó!",
                    data: token
                };
            }
        } catch (error) {
            return {
                status: TTCSconfig.STATUS_FAIL,
                data: null,
                message: "Hệ thống xảy ra xử cố, vui lòng thử lại sau",
            };
        }
    };
}




export { AuthServices };
