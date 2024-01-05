import lodash from "lodash";
import moment from "moment";
import mongoose from "mongoose";
import { TopicProgressModel } from "../database/topicProgress";
import TTCSconfig from "../submodule/common/config";
import { TopicProgress } from "../submodule/models/topicProgress";
import TopicService from "./topic";


const topicServices = new TopicService();
export default class TopicProgressService {
    getTopicProgress = async (body: {
        userId: string,
        topicIds?: string[],
        courseId?: string,
        type?: number
    }) => {
        const { userId, topicIds: _topicIds, courseId, type } = body
        let topicIds: string[] = []
        if (_topicIds && !!_topicIds.length) {
            topicIds = [..._topicIds]
        }

        else if (courseId && type) {
            const topicInCourse = await topicServices.getTopicsByCourse({
                idCourse: courseId,
                status: TTCSconfig.STATUS_PUBLIC,
                type,
                parentId: null,
                returnChildIds: true
            })

            if (topicInCourse.topicChildIds) {
                topicIds = [...topicInCourse.topicChildIds]
            }

        }

        if (!topicIds.length) {
            return {
                status: TTCSconfig.STATUS_FAIL,
                data: null
            }
        }

        const data = await TopicProgressModel.find({
            idUser: userId,
            idTopic: {
                $in: topicIds
            }
        })

        return {
            status: TTCSconfig.STATUS_SUCCESS,
            data
        }

    }

    upsertTopicProgress = async (body: Partial<TopicProgress>) => {
        try {
            const data = await TopicProgressModel.findOneAndUpdate(
                {
                    $or: [
                        { _id: new mongoose.Types.ObjectId(body._id) },
                        { idTopic: new mongoose.Types.ObjectId(body.idTopic) }
                    ]
                },
                {
                    $set: {
                        ...lodash.omit(body, ["_id"]),
                        lastUpdate: moment().valueOf()
                    },
                    $setOnInsert: {
                        createDate: moment().valueOf(),
                        answers: null
                    }
                },
                {
                    new: true,
                    upsert: true,
                    // setDefaultsOnInsert: true
                }
            )
            return {
                data: new TopicProgress(data),
                status: TTCSconfig.STATUS_SUCCESS
            }
        } catch (error) {
            console.log(error);

            return {
                data: null,
                status: TTCSconfig.STATUS_FAIL
            }
        }
    }
}