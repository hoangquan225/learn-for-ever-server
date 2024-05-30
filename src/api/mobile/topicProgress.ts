import express from 'express';
import async_handle from '../../utils/async_handle';
import TopicProgressService from '../../services/topicProgress';
import UserService from '../../services/user';

const topicProgressRouter = express.Router();
const topicProgressServices = new TopicProgressService();
const userService = new UserService();

topicProgressRouter.post("/update-topic-progress", async_handle(async (req, res) => { 
    const data = await topicProgressServices.upsertTopicProgress(req.body)
    res.json(data)
}))


topicProgressRouter.post("/update-study", async_handle(async (req, res) => { 
    const body = {
        ...req.body,
        questionAnswers: JSON.parse(req.body.questionAnswers)
    }
    let convertedArray: any = [];
    for (let idQuestion in body.questionAnswers) {
        let idAnswer = body.questionAnswers[idQuestion];
        let newObj = {
            idQuestion,
            idAnswer
        };
        convertedArray.push(newObj);
    }

    const { correctCount, incorrectCount, score } = await topicProgressServices.scoreCalculation(body)
    const payload: any = {
        idTopic: body.idTopic,
        idCourse: body.idCourse,
        idUser: body.idUser,
        status: 2,
        timeStudy: body.timeStudy,
        score: score,
        correctQuestion: correctCount,
        answers: convertedArray
    }
    await topicProgressServices.upsertTopicProgress(payload)
    await userService.updateStudyedForUser(payload)
    res.json({
        status: 0,
        score,
        numCorrect: correctCount,
        numIncorrect: incorrectCount
    })
}))


export { topicProgressRouter }