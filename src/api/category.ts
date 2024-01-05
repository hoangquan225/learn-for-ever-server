import express from 'express';
import CategoryService from '../services/category';
import asyncHandler from '../utils/async_handle';
import Endpoint from '../submodule/common/endpoint';
import TTCSconfig from '../submodule/common/config'
import { Category } from '../submodule/models/category';

const categoryRouter = express.Router();
const categoryService = new CategoryService();

categoryRouter.post(Endpoint.GET_CATEGORYS_BY_STATUS, asyncHandler(async (req, res) => {
    const data = await categoryService.getCategorysByStatus({status : Number(req.query.status)})
    
    return res.json({
        data,
        status: TTCSconfig.STATUS_SUCCESS
    })
}))

categoryRouter.post(Endpoint.GET_CATEGORYS_BY_SLUG, asyncHandler(async (req, res) => {
    const data = await categoryService.getCategorysBySlug({slug : `${req.query.slug}`})
    
    return res.json(data)
}))

categoryRouter.post(Endpoint.UPDATE_CATEGORY, asyncHandler(async (req, res) => {
    const data = await categoryService.updateCategory(new Category(req.body))
    return res.json(data)
}))

categoryRouter.post(Endpoint.ORDER_CATEGORY, asyncHandler(async (req, res) => {
    const data = await categoryService.orderCategory(req.body)
    return res.json(data)
}))

export { categoryRouter };
