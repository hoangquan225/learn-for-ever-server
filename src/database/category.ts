import mongoose, { Document, Model, model } from "mongoose";
import { Category } from "../submodule/models/category";
export const categoryTable = "Category"
interface ICategorySchema extends Model<CategoryDoc> {

}

export interface CategoryDoc extends Category, Document {
    id: string;
}

const CategorySchema = new mongoose.Schema<CategoryDoc, ICategorySchema>(
    {
        name: String,
        status: Number,
        avatar: String,
        des: String,
        slug: String,
        index: Number,
        createDate : { type: Number, default: Date.now() },
        updateDate : { type: Number, default: Date.now() },
    },
    {
        versionKey: false,
    }
);

export const CategoryModel = model(categoryTable, CategorySchema);