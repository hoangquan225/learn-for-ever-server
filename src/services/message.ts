import mongoose from "mongoose";
import { BadRequestError } from "../common/errors";
import { userTableName } from "../database/users";
import { deleteChatSocket, getReceiverSocketId, sendChatSocket, updateChatSocket } from "../socket";
import TTCSconfig from "../submodule/common/config";
import { Message } from "../submodule/models/message";
import { MessageModel } from "../database/message";
import { RomChatModel } from "../database/roomChat";

export default class ChatService {
  updateChat = async (body: Message & { realTime?: boolean }) => {
    const { id, userIdReceive, realTime = true } = body;
    let chatData: Message = new Message({});
    if (id) {
      // update
      try {
        const chat = await MessageModel.findOneAndUpdate(
          { _id: id },
          {
            $set: {
              ...body,
              updateDate: Date.now(),
            },
          },
          { new: true }
        )
        // .populate("idUser");
        if (!chat) {
          return {
            data: "không tồn tại",
            status: TTCSconfig.STATUS_NO_EXIST,
          };
        }
        chatData = new Message(chat);
        realTime && sendChatSocket({ chat: chatData });
        return {
          data: chatData,
          status: TTCSconfig.STATUS_SUCCESS,
        };
      } catch (error) {
        throw new BadRequestError();
      }
    } else {
      try {
        const newChat = await MessageModel.create({
          ...body,
          createDate: Date.now(),
          updateDate: Date.now(),
        })
        // .then(res => res.populate("userIdSend"));
        chatData = new Message(newChat);
        realTime && sendChatSocket({ chat: chatData });
        return {
          data: chatData,
          status: TTCSconfig.STATUS_SUCCESS,
        };
      } catch (error) {
        console.log({error});
        
        throw new BadRequestError();
      }
    }
  };

  getChatsByIdChat = async (body: { userIdSend: string, userIdReceive: string, roomId: string, limit: number, skip: number }) => {
    try {
      const { userIdSend, userIdReceive, roomId, limit, skip } = body;
      const chats = await Promise.all([
        MessageModel.find({
          users: { $all: [userIdSend, userIdReceive] },
          roomId,
          status: TTCSconfig.STATUS_PUBLIC  
        })
          .skip(skip)
          .limit(limit)
          // .populate("idUser")
          .sort({ "createDate": -1 }),
        MessageModel.countDocuments({
          users: { $all: [userIdSend, userIdReceive] },
          roomId,
          status: TTCSconfig.STATUS_PUBLIC
        })
      ])
      return {
        data: chats[0].reverse().map((chat) => new Message(chat)) ,
        total: chats[1],
        status: TTCSconfig.STATUS_SUCCESS,
      };
    } catch (error) {
      console.log({error});
      throw new BadRequestError();
    }
  };

  sendReactionChat = async (body: { idChat: string, idUser: string, type: number, realTime?: boolean }) => {
    const { idChat, idUser, type, realTime = true } = body
    try {
      const chat = await MessageModel.findById(idChat);
      if (chat) {
        let react  = chat.react;
        // let react  = [...chat.react || []];
        // const existingReactionIndex = react.findIndex(react => react.idUser === idUser);
        // if (existingReactionIndex !== -1) {
        //   if (react[existingReactionIndex].type === type) {
        //     react.splice(existingReactionIndex, 1);
        //   } else {
        //     react[existingReactionIndex].type = type;
        //   }
        // } else {
        //   react.push({ type, idUser });
        // }
        const updateChat = await MessageModel.findOneAndUpdate(
          { _id: idChat },
          {
            $set: {
              react,
              updateDate: Date.now(),
            },
          },
          { new: true }
        )
        // .populate("idUser");
        const chatData = new Message(updateChat);
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

  deleteChat =async (body : {id: string, roomId: string, realTime?: boolean }) => {
    const { id, realTime = true, roomId } = body;
    try {
      const deleteCount = MessageModel.deleteOne({_id: id});
      realTime && deleteChatSocket({ id: id, roomId });
      return deleteCount
    } catch (error) {
      throw new BadRequestError();
    }
  }

  getOrCreateRoomChat = async (body: {userIdSend: string, userIdReceive: string}) => {
    try {
      const {userIdSend, userIdReceive} = body;
      let room = await RomChatModel.findOne({
        users: { $all: [userIdSend, userIdReceive] },
      });
      if (!room) {
        room = await RomChatModel.create({
          users: [userIdSend, userIdReceive],
          userIdSend,
          userIdReceive
        });
      }
      return {
        data: room,
        status: TTCSconfig.STATUS_SUCCESS,
      }; 
    } catch (error) {
      return {
        data: null,
        status: TTCSconfig.STATUS_FAIL,
      }; 
    }
  }

  getFriendRoomChat = async (body: {userId}) => {
    try {
      const { userId } = body;
      let friend = await RomChatModel.find({
        $or: [
          { userIdSend: userId },
          { userIdReceive: userId }
        ]
      })
      .populate("userIdSend")
      .populate("userIdReceive")

      friend = friend.map((e: any) => {
          let user = null;
          if (e.userIdSend._id.toString() == userId) {
              user = e.userIdReceive;
          } else {
            user = e.userIdSend;
          }
          return { ...e.toObject(), user: user };
      });
      return {
        data: friend,
        status: TTCSconfig.STATUS_SUCCESS,
      }; 
    } catch (error) {
      return {
        data: null,
        status: TTCSconfig.STATUS_FAIL,
      }; 
    }
  }
}
