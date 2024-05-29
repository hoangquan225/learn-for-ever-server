import express from 'express';
import async_handle from '../../utils/async_handle';
import TopicProgressService from '../../services/topicProgress';

const topicProgressRouter = express.Router();
const topicProgressServices = new TopicProgressService();

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
    const { correctCount, incorrectCount, unansweredCount, score } = await topicProgressServices.scoreCalculation(body)
    const payload = {
        idTopic: body.idTopic,
        idCourse: body.idCourse,
        idUser: body.idUser,
        status: body.status,
        timeStudy: body.timeStudy,
        score: score,
        correctQuestion: correctCount,
        answers: convertedArray
    }
    const data = await topicProgressServices.upsertTopicProgress(payload)
    console.log({data});
    res.json({
        status: 0,
        score,
        numCorrect: correctCount,
        numIncorrect: incorrectCount 
    })
}))


export { topicProgressRouter }