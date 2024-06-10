import express from 'express';
import asyncHandler from '../../utils/async_handle';
import Endpoint from '../../submodule/common/endpoint';
import TTCSconfig from '../../submodule/common/config'
import StatisticService from '../../services/statistic';
import { authMiddleware, isAdmin } from '../../middleware/authMiddlewares';

const statisticRouter = express.Router();
const statisticService = new StatisticService();

statisticRouter.post(Endpoint.LOAD_STATISTIC, authMiddleware,isAdmin, asyncHandler(async (req, res) => {
    const data = await statisticService.loadStatistic(req.body)
    
    return res.json({
        data,
        status: TTCSconfig.STATUS_SUCCESS
    })
}))

statisticRouter.post("/cms/get-category-statistic", authMiddleware, isAdmin, asyncHandler(async (req, res) => {
    const data = await statisticService.getCategoryStatistic(req.query.status)
    return res.json({
        data,
        status: TTCSconfig.STATUS_SUCCESS
    })
}))

statisticRouter.post("/cms/topic-progress-statistic", authMiddleware, isAdmin, asyncHandler(async (req, res) => {
    const data = await statisticService.topicProgressStatistic(req.body)
    return res.json({
        data,
        status: TTCSconfig.STATUS_SUCCESS
    })
}))


export {statisticRouter}