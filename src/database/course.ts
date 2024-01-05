import mongoose, { Document, Model, model } from "mongoose";
import { Course } from "../submodule/models/course";
import { categoryTable } from "./category";
import { tagTable } from "./tag";
export const courseTable = "Course";
interface ICourseSchema extends Model<CourseDoc> {

}

export interface CourseDoc extends Course, Document {
    id: string;
}

const CourseSchema = new mongoose.Schema<CourseDoc, ICourseSchema>(
    {
        courseName: String,
        status: Number,
        des: String,
        shortDes: String,
        slug: String,
        avatar: String,
        idCategory: {
            type: mongoose.Types.ObjectId, 
            ref: categoryTable
        }, // danh mục : lớp 1,2,3,...
        idTag: {
            type: mongoose.Types.ObjectId,
            ref: tagTable
        }, // môn học vd : toán lý hóa ....
        createDate: {type: Number, default: Date.now()},
        updateDate: {type: Number, default: Date.now()},
    },
    {
        versionKey: false,
    }
);

export const CourseModel = model(courseTable, CourseSchema);