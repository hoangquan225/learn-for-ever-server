import { Router } from "express";
import async_handle from "../../utils/async_handle";
import CourseService from "../../services/course";
import TTCSconfig from "../../submodule/common/config";
import TopicService from "../../services/topic";

const router = Router();
const courseServices = new CourseService();
const topicServices = new TopicService();

router.post("/get-list-course-by-category-id", async_handle(async (req, res) => {
    if (!req.body.categoryId) {
        return res.json({
            data: null,
            status: TTCSconfig.STATUS_FAIL
        })
    }
    const data = await courseServices.getCourseByIdCategory(req.body)
    return res.json(data)
}))

router.post("/get-course-by-id", async_handle(async (req, res) => {
    if (!req.body.courseId) {
        return res.json({
            data: null,
            status: TTCSconfig.STATUS_FAIL
        })
    }
    const data = await courseServices.getCourseById({ id: req.body.courseId })
    return res.json({
        status: TTCSconfig.STATUS_SUCCESS,
        data
    })
}))

router.post("/count-topic-in-course", async_handle(async (req, res) => {
    const { courseId } = req.body as { courseId: string };
    if (!courseId) {
        return res.json({
            data: null,
            status: TTCSconfig.STATUS_FAIL
        })
    }
    const data = await topicServices.countTopicInCourse({ courseId })
    return res.json(data)
}))

export { router as routerCourseMobile }