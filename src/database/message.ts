import mongoose, { Document, Model, model } from "mongoose";
import { Message } from "../submodule/models/message";
import { userTableName } from "./users";

export const chatTable = "Message"
interface IMessageSchema extends Model<MessageDoc> {

}

export interface MessageDoc extends Message, Document {
    id: string;
}

const MessageSchema = new mongoose.Schema<MessageDoc, IMessageSchema>(
    {
        content: String,
        roomId: String,
        userIdSend: {
            type: mongoose.Types.ObjectId, 
            ref: userTableName
        },
        userIdReceive: {
            type: mongoose.Types.ObjectId, 
            ref: userTableName
        },
        users: [String],
        react: Number,
        type: Number, // 1: text, 2: image, 3: video, 4: file
        status: Number,
        index: Number,
        createDate : { type: Number, default: Date.now() },
        updateDate : { type: Number, default: Date.now() },
    },
    {
        versionKey: false,
    }
);

MessageSchema.path('userIdSend').ref(userTableName);

export const MessageModel = model(chatTable, MessageSchema);