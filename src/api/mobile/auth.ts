// import { Router } from "express";
// import async_handle from "../../utils/async_handle";
// import { encodeSHA256Pass } from "../../submodule/utils/crypto";
// import { UserModel } from "../../database/users";
// import TTCSconfig from "../../submodule/common/config";
// import { jwtDecodeToken, jwtEncode } from "../../utils/jwtToken";
// import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
// import { BadRequestError } from "../../common/errors";
// import { UserInfo } from "../../submodule/models/user";
// import { jwtMiddleware } from "./middleware";
// import _ from "lodash";

// const router = Router();

// router.post("/login", async_handle(async (req, res) => {
//     const { account, password } = req.body

//     const user = await UserModel.findOne({ account, status: TTCSconfig.STATUS_PUBLIC })
//     if (!user) {
//         return res.status(200).json({
//             status: TTCSconfig.STATUS_FAIL,
//             token: "-1" // không tồn tại
//         })
//     }

//     const encodedPassword = encodeSHA256Pass(account, password);

//     if (encodedPassword !== user.password) {
//         return res.status(200).json({
//             status: TTCSconfig.STATUS_FAIL,
//             token: "1" // sai password
//         })
//     }
//     const token = jwtEncode(user._id);
//     await UserModel.findByIdAndUpdate(user._id, { $set: { lastLogin: Date.now() } })

//     return res.json({
//         status: TTCSconfig.STATUS_SUCCESS,
//         token
//     })
// }))

// router.post("/session", jwtMiddleware, async_handle(async (req, res) => {
//     return res.status(200).json({})
// }))

// router.post("/register", async_handle(async (req, res) => {
//     const { account, password, email, phoneNumber, gender, reTypePassword, name } = req.body as Partial<UserInfo> & { reTypePassword?: string }
//     if (!account || !password || !email || !phoneNumber || !gender || !name) {
//         return res.status(400).json("params is not valid")
//     }
//     if (reTypePassword && reTypePassword !== password) return res.status(400).json("params is not valid")

//     const isExistUser = await UserModel.exists({
//         $or: [
//             { account },
//             { email }
//         ]
//     })
//     if (isExistUser) return res.status(200).json({
//         status: TTCSconfig.LOGIN_ACCOUNT_IS_USED,
//         token: null
//     })
//     const registerUser = await UserModel.create({
//         ...req.body,
//         password: encodeSHA256Pass(account, password),
//         registerDate: Date.now()
//     })
//     const token = jwtEncode(registerUser._id);
//     return res.json({
//         status: TTCSconfig.STATUS_SUCCESS,
//         token
//     })
// }))

// router.post("/user", jwtMiddleware, async_handle(async (req, res) => {
//     const { _id } = req.body;
//     const user = await UserModel.findOne({ _id });

//     return res.json(user)
// }))

// router.post("/update-user", async_handle(async (req, res) => {
//     const { _id, password, ...updateFeild } = req.body;
//     let _password: string | null = "";
//     const user = await UserModel.findOne({ _id })
//     if (!user) return res.json({ status: TTCSconfig.STATUS_NO_EXIST })

//     if (password) {
//         _password = encodeSHA256Pass(user.account, password)
//         if (!_password) return res.json({ status: TTCSconfig.STATUS_FAIL })
//         Object.assign(updateFeild, { password: _password })
//     }
//     await UserModel.findOneAndUpdate(
//         { _id },
//         { $set: { ...updateFeild } },
//     )
//     return res.json({
//         status: TTCSconfig.STATUS_SUCCESS
//     })
// }))

// export { router as authRouter }