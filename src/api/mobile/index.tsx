import express, { Router } from "express";
import asyncHandler from '../../utils/async_handle';

import { topicProgressRouter } from "./topicProgress";

const router = Router();
router.use(topicProgressRouter);

export { router as RouterMobile };