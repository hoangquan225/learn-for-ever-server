import mongoose, { Model, model } from "mongoose";
import { TopicProgress } from "../submodule/models/topicProgress";
import { userTableName } from "./users";
import { topicTable } from "./topic";
import TTCSconfig from "../submodule/common/config";
import { courseTable } from "./course";

export const topicProgressTable = "TopicProgress";

interface ITopicProgressSchema extends Model<TopicProgressDoc> {

}

export interface TopicProgressDoc extends TopicProgress, Document {
    _id: string;
}

const TopicProgressSchema = new mongoose.Schema<TopicProgressDoc, ITopicProgressSchema>(
    {
        idTopic: {
            type: mongoose.Types.ObjectId, 
            ref: topicTable
        },
        idCourse: {
            type: mongoose.Types.ObjectId, 
            ref: courseTable
        },
        idUser: {
            type: mongoose.Types.ObjectId, 
            ref: userTableName
        },  
        status: {
            type: Number, 
            default: TTCSconfig.STATUS_LEARN_NONE
        },
        timeStudy: Number,
        type: Number,
        score: Number,
        correctQuestion: Number,
        answers: [{
            idQuestion : String, 
            idAnswer: String
        }],
        lastUpdate: Number,
        createDate: Number
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

export const TopicProgressModel = model(topicProgressTable, TopicProgressSchema);