import mongoose, { Document, Model, model } from "mongoose";
import { userTableName } from "./users";
import { RoomChat } from "../submodule/models/roomChat";

export const romChatTable = "RomChat"
interface IRomChatSchema extends Model<RomChatDoc> {
}

export interface RomChatDoc extends RoomChat, Document {
    id: string;
}

const RomChatSchema = new mongoose.Schema<RomChatDoc, IRomChatSchema>(
    {
        users: [String],
        userIdSend: {
            type: mongoose.Types.ObjectId, 
            ref: userTableName
        },
        userIdReceive: {
            type: mongoose.Types.ObjectId, 
            ref: userTableName
        },
        createDate : { type: Number, default: Date.now() },
        updateDate : { type: Number, default: Date.now() },
    },
    {
        versionKey: false,
    }
);


export const RomChatModel = model(romChatTable, RomChatSchema);