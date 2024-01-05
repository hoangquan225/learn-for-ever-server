import express from 'express';
import async_handle from '../../utils/async_handle';
import TopicProgressService from '../../services/topicProgress';

const topicProgressRouter = express.Router();
const topicProgressServices = new TopicProgressService();

topicProgressRouter.post("/update-topic-progress", async_handle(async (req, res) => { 
    const data = await topicProgressServices.upsertTopicProgress(req.body)
    res.json(data)
}))

export { topicProgressRouter }