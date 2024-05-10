import express from 'express';
import ChatService from '../services/chat';
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
    const {userIdSend, userIdReceive, limit = 10, skip = 0} = req.query
    const data = await chatService.getChatsByIdChat({
        userIdSend: `${userIdSend}`,
        userIdReceive: `${userIdReceive}`,
        limit: Number(limit),
        skip: Number(skip)
    })
    
    return res.json(data)
}))

export {chatRouter}