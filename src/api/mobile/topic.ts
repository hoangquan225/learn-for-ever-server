import { Router } from "express";
import _ from "lodash";
import TopicService from "../../services/topic";
import TTCSconfig from "../../submodule/common/config";
import async_handle from "../../utils/async_handle";
import QuestionService from "../../services/question";
import { Topic } from "../../submodule/models/topic";
import { TopicModel } from "../../database/topic";
import { QuestionModel } from "../../database/question";
import { Question } from "../../submodule/models/question";
import { authMiddleware } from "../../middleware/authMiddlewares";
import TopicProgressService from "../../services/topicProgress";

const router = Router();
const topicServices = new TopicService();
const questionServices = new QuestionService();
const topicProgressService = new TopicProgressService();

router.post("/get-list-topic-by-courseId", async_handle(async (req, res) => {
    const { courseId, status, type } = req.body

    const match = {
        idCourse: courseId,
        type,
        status
    }
    const data = await TopicModel.find(match)

    const newData = await Promise.all(data.map(async (_topic) => {
        const topic = new Topic(_topic);
        if (topic.topicType === TTCSconfig.TYPE_TOPIC_VIDEO && !!topic.timePracticeInVideo?.length) {
            const questionIds = topic.timePracticeInVideo[0].idQuestion
            const questionDatas = await QuestionModel.find({
                _id: { $in: questionIds }
            })
            return {
                ...topic,
                timePracticeInVideo: [{
                    ...topic.timePracticeInVideo[0],
                    questionData: questionDatas.map(data => new Question(data))
                }]
            }
        }
        return topic
    }))

    return res.json({
        status: 0,
        data: newData
    })
}))

router.post("/get-topic-by-id", async_handle(async (req, res) => {
    const { topicId } = req.body;

    const data = await topicServices.getTopicById({ id: topicId })

    return res.json({
        status: TTCSconfig.STATUS_SUCCESS,
        data
    })

}))

router.post("/load-question-by-topic-id", async_handle(async (req, res) => {
    const { topicId } = req.body;
    const data = await questionServices.getQuestionsByTopic({
        status: 1,
        idTopic: topicId
    })
    return res.json({
        status: TTCSconfig.STATUS_SUCCESS,
        data
    })
}))


router.post("/get-topic-exam-by-courseId", async_handle(async (req, res) => {
    const { courseId, userId, status, type } = req.body

    const match = {
        idCourse: courseId,
        type: 2,
        status
    }
    const data = await TopicModel.find(match)
    const dataProgress = await topicProgressService.getTopicProgress({
        userId,
        topicIds: [],
        courseId,
        type
    })
    const newData = await Promise.all(data.map(async (_topic) => {
        const topic = new Topic(_topic);
        if (topic.topicType === TTCSconfig.TYPE_TOPIC_EXAM) {
            const itemProgress = dataProgress.data?.find(e => e.idTopic?.toString() == topic.id?.toString());
            let score = itemProgress ? itemProgress.score : null;
            return {
                ...topic,
                score
            }
        }
        return topic
    }))

    return res.json({
        status: 0,
        data: newData
    })
}))

export { router as TopicRouterMobile };
