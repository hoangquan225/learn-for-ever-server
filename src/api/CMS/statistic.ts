import express from 'express';
import asyncHandler from '../../utils/async_handle';
import Endpoint from '../../submodule/common/endpoint';
import TTCSconfig from '../../submodule/common/config'
import StatisticService from '../../services/statistic';

const statisticRouter = express.Router();
const statisticService = new StatisticService();

statisticRouter.post(Endpoint.LOAD_STATISTIC, asyncHandler(async (req, res) => {
    const data = await statisticService.loadStatistic(req.body)
    
    return res.json({
        data,
        status: TTCSconfig.STATUS_SUCCESS
    })
}))

export {statisticRouter}