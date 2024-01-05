import mongoose, { Document, Model, model } from "mongoose";
import { Tag } from "../submodule/models/tag";
import { categoryTable } from "./category";
export const tagTable = "Tag"
interface ITagSchema extends Model<TagDoc> {

}

export interface TagDoc extends Tag, Document {
    id: string;
}

const TagSchema = new mongoose.Schema<TagDoc, ITagSchema>(
    {
        name: String,
        status: Number,
        idCategory: {
            type: [mongoose.Types.ObjectId],
            ref: categoryTable,
        },
        createDate : {type: Number, default: Date.now()}, 
        updateDate : {type: Number, default: Date.now()},
    },
    {
        versionKey: false,
    }
);

export const TagModel = model(tagTable, TagSchema);