import mongoose, { Document, Model, model } from "mongoose";
import { Documents } from "../submodule/models/documents";
import { courseTable } from "./course";
import { topicTable } from "./topic";
export const documentTable = "Document";
interface IDocumentsSchema extends Model<DocumentsDoc> {

}

export interface DocumentsDoc extends Documents, Document {
    id: string;
}

const DocumentsSchema = new mongoose.Schema<DocumentsDoc, IDocumentsSchema>(
    {
        status: Number,
        reviewStatus: Number,
        index: Number,
        type: Number,
        description: String,
        shortDes: String,
        slug: String,
        avatar: String,
        idCourse: {
            type: mongoose.Types.ObjectId, 
            ref: courseTable
        },
        parentId: {
            type: mongoose.Types.ObjectId,
            ref: topicTable
        },
        createDate: {type: Number, default: Date.now()},
        updateDate: {type: Number, default: Date.now()},
        startDate: Number,
        endDate: Number,
    },
    {
        versionKey: false,
    }
);

export const CourseModel = model(documentTable, DocumentsSchema);