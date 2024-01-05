import express from 'express';
import QuestionService from '../services/question';
import asyncHandler from '../utils/async_handle';
import Endpoint from '../submodule/common/endpoint';
import TTCSconfig from '../submodule/common/config'
import { Question } from '../submodule/models/question';

const questionRouter = express.Router();
const questionService = new QuestionService();

questionRouter.post(Endpoint.GET_QUESTIONS_BY_STATUS, asyncHandler(async (req, res) => {
    const data = await questionService.getQuestionsByStatus({status : Number(req.query.status)})
    return res.json({
        data,
        status : TTCSconfig.STATUS_SUCCESS
    })
}))

questionRouter.post(Endpoint.GET_QUESTIONS_BY_TOPIC, asyncHandler(async (req, res) => {
    const data = await questionService.getQuestionsByTopic({
        status : Number(req.query.status),
        idTopic: `${req.query.idTopic}`
    })
    return res.json({
        data,
        total: data.length,
        status : TTCSconfig.STATUS_SUCCESS
    })
}))

questionRouter.post(Endpoint.UPDATE_QUESTION, asyncHandler(async (req, res) => {
    const data = await questionService.updateQuestion(new Question(req.body))
    return res.json(data)
}))

questionRouter.post(Endpoint.ORDER_QUESTION, asyncHandler(async (req, res) => {
    const data = await questionService.orderQuestion(req.body)
    return res.json(data)
}))

questionRouter.post(Endpoint.DELETE_QUESTION, asyncHandler(async (req, res) => {
    const data = await questionService.deletetQuestions(req.body)
    return res.json(data)
}))

export { questionRouter };
