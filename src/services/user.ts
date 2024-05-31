// import _ from "lodash";
import mongoose from 'mongoose';
import TTCSconfig from '../submodule/common/config';
// import { Department } from '../../../models/department';
import { UserInfo } from "../submodule/models/user";
import { UserModel } from "../database/users";
import { jwtDecodeToken } from '../utils/jwtToken';
import { decrypt, encodeSHA256Pass, encrypt } from '../submodule/utils/crypto';
import { BadRequestError } from '../common/errors';
import { TopicModel } from '../database/topic';
// import { UserDepartmentModel } from "../database/mongo/user_department";

export default class UserService {
    private processPass(userObject: {
        account: string;
        password: string;
    }) {
        const decryptedResult = decrypt(userObject.password);
        const encodedPassword = encodeSHA256Pass(userObject.account, decryptedResult);
        return encodedPassword;
    }

    updateUserInfo = async (body: { token: string, userInfo: UserInfo }): Promise<{
        status: number,
        userInfo: UserInfo | null,
    }> => {
        const tokenDecode = jwtDecodeToken(body.token);
        let userInfo = new UserInfo(body.userInfo)
        let status = TTCSconfig.STATUS_SUCCESS;

        try {
            // const findUser = await UserModel.findOne({ _id: body.userInfo._id });
            const userUpdate = await UserModel.findOneAndUpdate({ _id: tokenDecode._id }, { $set: { ...body.userInfo } }, { new: true });
            userInfo = new UserInfo(userUpdate);

            return {
                status,
                userInfo
            }
        } catch (err) {
            return {
                status: TTCSconfig.STATUS_FAIL,
                userInfo: null
            }
        }
    }

    checkUserFromToken = async (token: string): Promise<{
        status: number,
        userInfo: UserInfo | null,
    }> => {
        const tokenDecode = jwtDecodeToken(token);
        let status = TTCSconfig.STATUS_SUCCESS;
        // find db 
        try {
            const userInfo = await UserModel.findOne({ _id: tokenDecode?._id });
            if (!userInfo) {
                status = TTCSconfig.STATUS_FAIL
            }
            return {
                status,
                userInfo
            }
        } catch (error) {
            return {
                status: TTCSconfig.STATUS_FAIL,
                userInfo: null
            }
        }
    }

    changePassword = async (body: { token: string, password: string, newPassword: string }): Promise<UserInfo> => {
        const { newPassword, token, password } = body;
        const tokenDecode = jwtDecodeToken(token);

        let userInfo = new UserInfo();
        try {
            const checkUser = new UserInfo(await UserModel.findOne({ _id: tokenDecode?._id }));
            const passEncode = this.processPass({ account: checkUser?.account, password: password });

            if (checkUser._id) {
                if (passEncode === checkUser.password) {
                    const newPasswordEncode = this.processPass({ account: checkUser?.account, password: newPassword });
                    const userUpdatePassword = await UserModel.findOneAndUpdate({ _id: tokenDecode?._id }, { $set: { password: newPasswordEncode } }, { new: true });
                    userInfo = new UserInfo(userUpdatePassword);
                    userInfo.loginCode = TTCSconfig.LOGIN_SUCCESS;

                    return userInfo;
                } else {
                    userInfo.loginCode = TTCSconfig.LOGIN_WRONG_PASSWORD;
                }
            } else {
                userInfo.loginCode = TTCSconfig.LOGIN_TOKEN_INVALID;
            }
            return userInfo
        } catch (error) {
            userInfo.loginCode = TTCSconfig.LOGIN_FAILED;
            return userInfo;
        }
    }

    getUserById = async (body: { userId: string }): Promise<UserInfo> => {
        const userInfo = await UserModel.findOne({ _id: body.userId })

        return new UserInfo(userInfo);
    }

    updateStudyedForUser = async (body: {
        idTopic: string,
        idCourse: string,
        idUser: string,
        status: number,
        timeStudy: number,
        score: number,
        correctQuestion: number,
        answers: Array<{
            idQuestion : string, 
            idAnswer: string
        }>
    }) => {
        const { idTopic, idUser, status, timeStudy, score, correctQuestion, answers, idCourse } = body
        try {
            // get use 
            const user = await UserModel.findOne({_id: idUser})
            if (user && idCourse) {
                const userInfo = new UserInfo(user)
                // let newProgress = userInfo.progress

                const newProgress = { ...userInfo.progress }
                const courseProgress = newProgress[idCourse]

                if (courseProgress) {
                    const progress = newProgress[idCourse].findIndex(o => o.idTopic == idTopic)
                    if(progress !== undefined && progress !== -1) {
                        newProgress[idCourse].splice(progress, 1)
                    }
                    newProgress[idCourse] = [...(newProgress[idCourse] || []), {
                        status,
                        idTopic,
                        timeStudy,
                        score,
                        correctQuestion,
                        answers,
                    }]
                }else {
                    newProgress[idCourse] = [{
                        status,
                        idTopic,
                        timeStudy,
                        score,
                        correctQuestion,
                        answers,
                    }]
                }
                
                const res = await UserModel.findOneAndUpdate(
                    { _id: idUser }, 
                    { $set: { progress: newProgress } }, 
                    { new: true }
                )
                return {
                    data: res, 
                    status: TTCSconfig.STATUS_SUCCESS
                }
            } else {
                return {
                    status: TTCSconfig.RESPONSIVE_NULL
                }
            }
        } catch (error) {
            throw new BadRequestError()
        }
    }

    getTotalLearnedTopic = async (body: {
        idCourse: string,
        idUser: string,
    }) => {
        const { idCourse, idUser } = body
        try {
            const topics = await TopicModel.find({idCourse, status: TTCSconfig.STATUS_PUBLIC})
            const user = await UserModel.findOne({_id: idUser})
            const progress = { ...user?.progress }[idCourse]
            const res = topics.filter((o1) => progress && progress.some((o2) => o2.idTopic.toString() === o1._id.toString() && o1.type === 1)).length;
            return {
                totalLearned: res,
                status: TTCSconfig.STATUS_SUCCESS
            }
        } catch (error) {
            throw new BadRequestError()
        }
    }

    findByEmail = async (body: { email: string }) => {
        try {
            const user = await UserModel.find({email: { $regex: `^${body.email}`, $options: 'i' }})
            return {
                data: user?.map(e => new UserInfo(e)),
                status: TTCSconfig.STATUS_SUCCESS
            }
        } catch (error) {
            throw new BadRequestError()
        }
    }

    updateStatusUser = async (body: { userId: string, status: number }) => {
        try {
           const { userId, status } = body;
            const updatedUser = await UserModel.findOneAndUpdate(
                { _id: userId }, 
                { status: status },
                { new: true }
            );
            return {
                data: updatedUser,
                status: updatedUser ? TTCSconfig.STATUS_SUCCESS :  TTCSconfig.STATUS_FAIL
            }
        } catch (error) {
            throw new BadRequestError()
        }
    }

    getAllUser = async (status: any) => {
        try {
            let query = {
                status: {$ne: TTCSconfig.STATUS_DELETED},
                userRole: {$ne: TTCSconfig.ROLE_ADMIN},
            };
            
            if (status != -2 && status !== undefined) {
                query.status = status;
            }
            const users = await UserModel.find(query);
            return {
                data: users.map((user) => new UserInfo(user)),
                status: TTCSconfig.STATUS_SUCCESS
            };
        } catch (error) {
            throw new BadRequestError();
        }
    };
}