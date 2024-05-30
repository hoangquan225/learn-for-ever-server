import lodash from "lodash";
import moment from "moment";
import mongoose from "mongoose";
import { TopicProgressModel } from "../database/topicProgress";
import TTCSconfig from "../submodule/common/config";
import { TopicProgress } from "../submodule/models/topicProgress";
import TopicService from "./topic";
import { CourseModel } from "../database/course";
import { Course } from "../submodule/models/course";
import { TopicModel } from "../database/topic";
import { QuestionModel } from "../database/question";
import { Question } from "../submodule/models/question";


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
            const topicInCourse = await topicServices.getTopicsByCourseMoblie({
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

    getTopicProgressForAchievement = async (body: {
        idUser: string,
        idCourse?: string,
        idTopic?: string,
        type?: number
    }) => {
        try {
            const { idUser, idTopic, idCourse, type } = body
            const query: any = {};
            query.idUser = idUser
            if(idCourse) {
                query.idCourse = idCourse
            }
            if(type) {
                query.type = type
            }
            if(idTopic) {
                query.idTopic = idTopic
            }
            const data = (await TopicProgressModel.find(query).populate("idTopic")).map(o => new TopicProgress(o))

            const course = new Course(await CourseModel.findById(idCourse).populate('idCategory'))
            const dataAddPath = data.map(o => {
                return {
                    ...new TopicProgress(o),
                    path: 
                        o.type === 2 
                        ? 
                            `/${course?.category?.slug}/${course?.slug}/de-kiem-tra/${course?.id}-2/${o.idTopic}` 
                        :
                            (
                                o.type === 1 
                                ? `/${course?.category?.slug}/${course?.slug}/chuong-trinh-hoc/${course?.id}-1` 
                                : ""
                            )
                }
            })

            return {
                status: TTCSconfig.STATUS_SUCCESS,
                data:dataAddPath
            }
        } catch (error) {
            console.log(error);
            return {
                data: null,
                status: TTCSconfig.STATUS_FAIL
            }
        }

    }

    upsertTopicProgress = async (body: Partial<TopicProgress>) => {
        try {
            if (!body.idTopic) {
                body = {
                    ...body,
                    createDate: moment().valueOf()
                };
            } else {
                body = {
                    ...lodash.omit(body, ["_id"]),
                    lastUpdate: moment().valueOf()
                };
            }

            const data = await TopicProgressModel.findOneAndUpdate(
                {
                    $or: [
                        { _id: new mongoose.Types.ObjectId(body._id) },
                        { idTopic: new mongoose.Types.ObjectId(body.idTopic) }
                    ]
                },
                {
                    $set: body
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

    scoreCalculation = async (body) => {
        try {
            const { idTopic, idUser, idCourse, timeStudy, questionAnswers } = body
            let correctCount = 0;
            let incorrectCount = 0;
            let unansweredCount = 0;
            const questions = await QuestionModel.find({
                status: 1,
                idTopic
            }) 
            const questionsModel = questions.map(o => new Question(o))
            questionsModel.forEach((e: any) => {
                const answerId = questionAnswers[e.id];
                if (!answerId) {
                    unansweredCount++;
                } else {
                    const correctAnswer = e.answer.find(answer => answer._id.toString() === answerId && answer.isResult);
                    if (correctAnswer) {
                        correctCount++;
                    } else {
                        incorrectCount++;
                    }
                }
            });
            let score = correctCount/(incorrectCount+unansweredCount+correctCount)*10;
            return {
                correctCount,
                incorrectCount: incorrectCount+unansweredCount,
                unansweredCount,
                score
            };
        } catch (error) {
            console.log(error);
            return {
                data: null,
                status: TTCSconfig.STATUS_FAIL
            }
        }
    }
}