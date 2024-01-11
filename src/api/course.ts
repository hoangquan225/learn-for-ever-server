import express from 'express';
import CourseService from '../services/course';
import asyncHandler from '../utils/async_handle';
import Endpoint from '../submodule/common/endpoint';
import TTCSconfig from '../submodule/common/config'
import { Course } from '../submodule/models/course';

const courseRouter = express.Router();
const courseService = new CourseService();

courseRouter.post(Endpoint.GET_COURSES_BY_STATUS, asyncHandler(async (req, res) => {
    const data = await courseService.getCoursesByStatus({status : Number(req.query.status)})
    return res.json({
        data,
        status : TTCSconfig.STATUS_SUCCESS
    })
}))

courseRouter.post(Endpoint.GET_COURSES_BY_ID, asyncHandler(async (req, res) => {
    const data = await courseService.getCourseById({id : `${req.query.id}`})
    return res.json({
        data,
        status : TTCSconfig.STATUS_SUCCESS
    })
}))

courseRouter.post(Endpoint.GET_COURSES_BY_ID_TAG_AND_CATEGORY, asyncHandler(async (req, res) => {
    const data = await courseService.getByIdTagAndCategory({idCategory: `${req.query.idCategory}`, idTag: `${req.query.idTag}`, status : Number(req.query.status)})
    return res.json({
        data,
        status : TTCSconfig.STATUS_SUCCESS
    })
}))

courseRouter.post(Endpoint.GET_COURSE_BY_SLUG, asyncHandler(async (req, res) => {
    const { isInfoTopic = false, status = TTCSconfig.STATUS_PUBLIC, slug } = req.query
    const data = await courseService.getCoursesBySlug({
        slug: `${slug || ''}`, 
        status: Number(status),
        isInfoTopic: Boolean(isInfoTopic)
    })
    return res.json(data)
}))

courseRouter.post(Endpoint.UPDATE_COURSE, asyncHandler(async (req, res) => {
    const data = await courseService.updateCourse(new Course(req.body))
    return res.json(data)
}))

courseRouter.post(Endpoint.GET_INFO_TOPIC_BY_COURSE, asyncHandler(async (req, res) => {
    const data = await courseService.getInfoTopicByCourse({
        idCourse: `${req.query.idCourse}`
    })
    return res.json(data)
}))

export { courseRouter };
