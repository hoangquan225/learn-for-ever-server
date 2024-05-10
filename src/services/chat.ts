import mongoose from "mongoose";
import { BadRequestError } from "../common/errors";
import { userTableName } from "../database/users";
import { deleteChatSocket, sendChatSocket, updateChatSocket } from "../socket";
import TTCSconfig from "../submodule/common/config";
import { Chat } from "../submodule/models/chat";
import { ChatModel } from "../database/chat";

export default class ChatService {
  updateChat = async (body: Chat & { realTime?: boolean }) => {
    const { id, realTime = true } = body;
    let chatData: Chat = new Chat({});
    if (id) {
      // update
      try {
        const chat = await ChatModel.findOneAndUpdate(
          { _id: id },
          {
            $set: {
              ...body,
              updateDate: Date.now(),
            },
          },
          { new: true }
        ).populate("idUser");
        if (!chat) {
          return {
            data: "không tồn tại",
            status: TTCSconfig.STATUS_NO_EXIST,
          };
        }
        chatData = new Chat(chat);
        realTime && sendChatSocket({ chat: chatData });
        return {
          data: chatData,
          status: TTCSconfig.STATUS_SUCCESS,
        };
      } catch (error) {
        throw new BadRequestError();
      }
    } else {
      // create
      try {
        const newChat = await ChatModel.create({
          ...body,
          createDate: Date.now(),
          updateDate: Date.now(),
        }).then(res => res.populate("userIdSend"));
        chatData = new Chat(newChat);
        realTime && sendChatSocket({ chat: chatData });
        return {
          data: chatData,
          status: TTCSconfig.STATUS_SUCCESS,
        };
      } catch (error) {
        throw new BadRequestError();
      }
    }
  };

  getChatsByIdChat = async (body: { userIdSend: string, userIdReceive: string, limit: number, skip: number }) => {
    try {
      const { userIdSend, userIdReceive, limit, skip } = body;
      const chats = await Promise.all([
        ChatModel.find({
          $or: [
            { idChat: `${userIdSend}-${userIdReceive}`},
            { idChat: `${userIdReceive}-${userIdSend}`},
          ],
          status: TTCSconfig.STATUS_PUBLIC  
        })
          .skip(skip)
          .limit(limit)
          .populate("idUser")
          .sort({ "createDate": -1 }),
        ChatModel.countDocuments({
          $or: [
            { idChat: `${userIdSend}-${userIdReceive}`},
            { idChat: `${userIdReceive}-${userIdSend}`},
          ],
          status: TTCSconfig.STATUS_PUBLIC
        })
      ])
      return {
        data: chats[0].map((chat) => new Chat(chat)),
        total: chats[1],
        status: TTCSconfig.STATUS_SUCCESS,
      };
    } catch (error) {
      throw new BadRequestError();
    }
  };

  sendReactionChat = async (body: { idChat: string, idUser: string, type: number, realTime?: boolean }) => {
    const { idChat, idUser, type, realTime = true } = body
    try {
      const chat = await ChatModel.findById(idChat);
      if (chat) {
        let react  = [...chat.react || []];
        const existingReactionIndex = react.findIndex(react => react.idUser === idUser);

        if (existingReactionIndex !== -1) {
          if (react[existingReactionIndex].type === type) {
            react.splice(existingReactionIndex, 1);
          } else {
            react[existingReactionIndex].type = type;
          }
        } else {
          react.push({ type, idUser });
        }

        const updateChat = await ChatModel.findOneAndUpdate(
          { _id: idChat },
          {
            $set: {
              react,
              updateDate: Date.now(),
            },
          },
          { new: true }
        ).populate("idUser");
        const chatData = new Chat(updateChat);
        realTime && updateChatSocket({ chat: chatData });
        return {
          status: TTCSconfig.STATUS_SUCCESS,
        };
      } else {
        return {
          status: TTCSconfig.STATUS_NO_EXIST,
        };
      }
    } catch (error) {
      throw new BadRequestError();
    }
  }

  deleteChat =async (body : {id: string, idChat: string, realTime?: boolean }) => {
    const { id, realTime = true, idChat } = body;
    try {
      const deleteCount = ChatModel.deleteOne({_id: id});
      realTime && deleteChatSocket({ id: id, idChat });
      return deleteCount
    } catch (error) {
      throw new BadRequestError();
    }
  }
}
