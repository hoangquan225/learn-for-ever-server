import express from 'express';
import RasaService from '../services/rasa';
import asyncHandler from '../utils/async_handle';
import Endpoint from '../submodule/common/endpoint';
import TTCSconfig from '../submodule/common/config'

const rasaRouter = express.Router();
const rasaService = new RasaService();

rasaRouter.get("/getStatistic", asyncHandler(async (req, res) => {
    const {data, status} = await rasaService.getStatistic(req.query.params)
    return res.json({
        data
    })
}))

rasaRouter.get("/getCourseInfo", asyncHandler(async (req, res) => {
    const {data, status} = await rasaService.getCourseInfo(req.query)
    return res.json({
        data
    })
}))

export { rasaRouter };
