import mongoose, { Document, Model, model } from "mongoose";
import { Question } from "../submodule/models/question";
import { topicTable } from "./topic";
export const questionTable = "Question";
interface IQuestionSchema extends Model<QuestionDoc> {

}

export interface QuestionDoc extends Question, Document {
    id: string;
}

const QuestionSchema = new mongoose.Schema<QuestionDoc, IQuestionSchema>(
    {
        question: String,
        result: [{
            index: Number,
            text: String
        }], // đáp án đúng: có thể có nhiều đáp án đúng
        answer: [{
            index: Number,
            text: String, 
            isResult: Boolean,
        }], // đáp án,
        questionChild: {
            type: [mongoose.Types.ObjectId], 
            ref: questionTable
        },
        parentId: {
            type: mongoose.Types.ObjectId, 
            ref: questionTable
        },
        status: Number,
        idTopic: {
            type: mongoose.Types.ObjectId, 
            ref: topicTable
        },
        hint: String,
        index : Number,
        createDate: {type : Number, default: Date.now()},
        updateDate: {type: Number, default: Date.now()},
    },
    {
        versionKey: false,
    }
);

export const QuestionModel = model(questionTable, QuestionSchema);