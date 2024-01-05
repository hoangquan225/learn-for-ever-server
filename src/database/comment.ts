import mongoose, { Document, Model, model } from "mongoose";
import { Comment } from "../submodule/models/comment";
import { userTableName } from "./users";

export const commentTable = "Comment"
interface ICommentSchema extends Model<CommentDoc> {

}

export interface CommentDoc extends Comment, Document {
    id: string;
}

const CommentSchema = new mongoose.Schema<CommentDoc, ICommentSchema>(
    {
        content: String,
        idTopic: String,
        idUser: {
            type: mongoose.Types.ObjectId, 
            ref: userTableName
        },
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

CommentSchema.path('idUser').ref(userTableName);

export const CommentModel = model(commentTable, CommentSchema);