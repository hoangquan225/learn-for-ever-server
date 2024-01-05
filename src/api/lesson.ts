import express from 'express';
import LessonService from '../services/lesson';
import asyncHandler from '../utils/async_handle';
import Endpoint from '../submodule/common/endpoint';
import TTCSconfig from '../submodule/common/config'
import { Lesson } from '../submodule/models/lesson';

const lessonRouter = express.Router();
const lessonService = new LessonService();

lessonRouter.post(Endpoint.GET_LESSONS_BY_STATUS, asyncHandler(async (req, res) => {
    const data = await lessonService.getLessonsByStatus({status : Number(req.query.status)})
    return res.json({
        data,
        status : TTCSconfig.STATUS_SUCCESS
    })
}))

lessonRouter.post(Endpoint.GET_LESSONS_BY_IDTOPIC, asyncHandler(async (req, res) => {
    const data = await lessonService.getLessonByIdTopic({
        status : Number(req.query.status), 
        idTopic: `${req.query.idTopic}`
    })
    return res.json(data)
}))

lessonRouter.post(Endpoint.UPDATE_LESSON, asyncHandler(async (req, res) => {
    const data = await lessonService.updateLesson(new Lesson(req.body))
    return res.json(data)
}))

export { lessonRouter };
