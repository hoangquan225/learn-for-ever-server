import mongoose, { Document, Model, model } from "mongoose";
import { Chat } from "../submodule/models/chat";
import { userTableName } from "./users";

export const chatTable = "Chat"
interface IChatSchema extends Model<ChatDoc> {

}

export interface ChatDoc extends Chat, Document {
    id: string;
}

const ChatSchema = new mongoose.Schema<ChatDoc, IChatSchema>(
    {
        content: String,
        idChat: String,
        userIdSend: {
            type: mongoose.Types.ObjectId, 
            ref: userTableName
        },
        userIdReceive: {
            type: mongoose.Types.ObjectId, 
            ref: userTableName
        },
        users: [String],
        react: [{
            type: {type: Number}, 
            idUser: String
        }],
        status: Number,
        index: Number,
        createDate : { type: Number, default: Date.now() },
        updateDate : { type: Number, default: Date.now() },
    },
    {
        versionKey: false,
    }
);

ChatSchema.path('userIdSend').ref(userTableName);

export const ChatModel = model(chatTable, ChatSchema);