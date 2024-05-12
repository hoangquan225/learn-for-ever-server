import express from 'express';
import ChatService from '../services/message';
import ENDPONTAPI from '../submodule/common/endpoint';
import asyncHandler from '../utils/async_handle';

const chatRouter = express.Router();
const chatService = new ChatService();

chatRouter.post(ENDPONTAPI.UPDATE_CHAT, asyncHandler(async (req, res) => {
    const data = await chatService.updateChat(req.body)
    return res.json(data)
}))

chatRouter.post(ENDPONTAPI.DELETE_COMMENT, asyncHandler(async (req, res) => {
    const data = await chatService.deleteChat(req.body)
    return res.json(data)
}))

chatRouter.post(ENDPONTAPI.SEND_REACTION_COMMENT, asyncHandler(async (req, res) => {
    const data = await chatService.sendReactionChat(req.body)
    
    return res.json(data)
}))

chatRouter.post(ENDPONTAPI.GET_CHAT, asyncHandler(async (req, res) => {
    const {userIdSend, userIdReceive, roomId, limit = 20, skip = 0} = req.query
    const data = await chatService.getChatsByIdChat({
        userIdSend: `${userIdSend}`,
        userIdReceive: `${userIdReceive}`,
        roomId: `${roomId}`,
        limit: Number(limit),
        skip: Number(skip)
    })
    
    return res.json(data)
}))

chatRouter.post("/room-chat/get-or-craete", asyncHandler(async (req, res) => {
    const {data, status} = await chatService.getOrCreateRoomChat(req.body)
    return res.json({data, status})
}))

chatRouter.post("/room-chat/get-friend", asyncHandler(async (req, res) => {
    const {data, status} = await chatService.getFriendRoomChat(req.body)
    return res.json({data, status})
}))

export {chatRouter}