import moment from "moment";
import { BadRequestError } from "../common/errors";
import { FeedbackModel } from "../database/feedback";
import TTCSconfig from "../submodule/common/config";
import { Feedback } from "../submodule/models/feedback";


export default class FeedbackService {
    // get all 
    getFeedbacks = async (body: { limit: number, skip: number }) => {
        try {
            const { limit, skip } = body;
            const feedbacks = await FeedbackModel.find({ status: { $exists: true, $ne: -1 } })
            .sort({"createDate" : -1})
            .skip(skip)
            .limit(limit)
            .populate('idUser')
            .populate('idQuestion')
            const count = await FeedbackModel.countDocuments({ status: { $exists: true, $ne: -1 } })
            return {
                data: feedbacks.map(feedback => new Feedback(feedback)), 
                count
            }
        } catch (error) {
            throw new BadRequestError();
        }
    }

    getFeedbacksByCourse = async (body: {idCourse: string}) => {
        try {
            const feedbacks = await FeedbackModel.find({
                idCourse : body.idCourse, status: { $exists: true, $ne: -1 }
            }).populate('idUser').populate('idQuestion')
            const count = await FeedbackModel.countDocuments({
                idCourse : body.idCourse
            })
            return {
                data : feedbacks.map(feedback => new Feedback(feedback)), 
                count
            }
        } catch (error) {
            throw new BadRequestError()
        }
    }

    getFeedbacksByTypeOrCourse = async (body: { type: string[], idCourse: string, limit: number, skip: number}) => {
        const {type, idCourse, limit, skip} = body
        try {
            let feedbacks
            let count
            if(type !== undefined && idCourse !== "") {
                feedbacks = await FeedbackModel.find({type: {$all: type}, idCourse,  status: { $exists: true, $ne: -1 }}).skip(skip).limit(limit).populate('idUser').populate('idQuestion')
                count = await FeedbackModel.countDocuments({type: {$all: type}, idCourse,  status: { $exists: true, $ne: -1 }})
            }else if (type !== undefined) {
                feedbacks = await FeedbackModel.find({type: {$all: type}, status: { $exists: true, $ne: -1 }}).skip(skip).limit(limit).populate('idUser').populate('idQuestion')
                count = await FeedbackModel.countDocuments({type: {$all: type}, status: { $exists: true, $ne: -1 }})
            } else {
                feedbacks = await FeedbackModel.find({
                    idCourse : body.idCourse, status: { $exists: true, $ne: -1 }
                }).skip(skip).limit(limit).populate('idUser').populate('idQuestion')
                count = await FeedbackModel.countDocuments({
                    idCourse : body.idCourse, status: { $exists: true, $ne: -1 } 
                })
            }
            return {
                data : feedbacks.map(feedback => new Feedback(feedback)), 
                count
            }
        } catch (error) {
            throw new BadRequestError()
        }
    }

    updateFeedback = async (body: Feedback)=> {
        if (body?.id) {
            // update
            try {
                const feedback = await FeedbackModel.findOneAndUpdate(
                    { _id: body?.id },
                    {
                        $set: {
                            ...body,
                            updateDate: moment()
                        }
                    },
                    { new: true }
                );
                return feedback
            } catch (error) {
                throw new BadRequestError();
            }
        } else {
            try {
                const feedback = await FeedbackModel.create({
                    ...body, 
                    createDate: moment(),
                    updateDate: moment()
                })
                return feedback
            } catch (error) {
                throw new BadRequestError()
            }
        }
    } 
}