import { Router } from 'express';
import { authRouter } from '../api/web/auth';
import { userRouter } from '../api/user';
import { categoryRouter } from '../api/category';
import { courseRouter } from '../api/course';
import { lessonRouter } from '../api/lesson';
import { questionRouter } from '../api/question';
import { tagRouter } from '../api/tag';
import { topicRouter } from '../api/topic';
import { uploadRouter } from '../api/upload';
import { feedbackRouter } from '../api/feedback';
import { statisticRouter } from '../api/CMS/statistic';
import { commentRouter } from '../api/comment';
import { topicProgressRouter } from '../api/topicProgress';
import { chatRouter } from '../api/chat';
import { uploadFileXlsRouter } from '../api/uploadExcel';
import { rasaRouter } from '../api/rasa';

const router = Router();

router.use(authRouter);
router.use(userRouter);
router.use(categoryRouter);
router.use(courseRouter);
router.use(lessonRouter);
router.use(questionRouter);
router.use(tagRouter);
router.use(topicRouter);
router.use(uploadRouter);
router.use(feedbackRouter);
router.use(statisticRouter);
router.use(commentRouter)
router.use(topicProgressRouter)
router.use(chatRouter)
router.use(uploadFileXlsRouter)
router.use(rasaRouter)

export { router as webRouters };
