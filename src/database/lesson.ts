import mongoose, { Document, Model, model } from "mongoose";
import { Lesson } from "../submodule/models/lesson";
import { topicTable } from "./topic";
export const lessonTable = "Lesson";
interface ILessonSchema extends Model<LessonDoc> {

}

export interface LessonDoc extends Lesson, Document {
    id: string;
}

const LessonSchema = new mongoose.Schema<LessonDoc, ILessonSchema>(
    {
        status: Number,
        idTopic: {
            type: mongoose.Types.ObjectId, 
            ref: topicTable
        },
        video: String,
        des: String,
        type: Number,
        createDate: {type: Number, default: Date.now()},
        updateDate: {type: Number, default: Date.now()},
    },
    {
        versionKey: false,
    }
);

export const LessonModel = model(lessonTable, LessonSchema);