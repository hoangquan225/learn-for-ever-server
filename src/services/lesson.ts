import { BadRequestError } from "../common/errors";
import { LessonModel } from "../database/lesson";
import TTCSconfig from "../submodule/common/config";
import { Lesson } from "../submodule/models/lesson"

export default class LessonService {
    // get 
    getLessonsByStatus = async (body: { status: number }): Promise<Lesson[]> => {
        try {
            const lessons = await LessonModel.find({ status: body.status })
            return lessons
        } catch (error) {
            throw new BadRequestError();
        }
    }

    getLessonByIdTopic = async (body: {
        status: number,
        idTopic: string
    }) => {
        try {
            const lessons = await LessonModel.findOne({
                status: body.status,
                idTopic: body.idTopic
            })
            if (lessons) {
                return {
                    status: TTCSconfig.STATUS_SUCCESS,
                    data: new Lesson(lessons)
                }
            } 
            return {
                data: null, 
                status: TTCSconfig.STATUS_SUCCESS
            }
        } catch (error) {
            throw new BadRequestError();
        }
    }

    // update and create
    updateLesson = async (body: Lesson): Promise<{
        data: Lesson | string,
        status: number
    }> => {
        if (body?.id) {
            // update
            try {
                const lessons = await LessonModel.findOneAndUpdate(
                    { _id: body?.id },
                    {
                        $set: {
                            ...body,
                            updateDate: Date.now()
                        }
                    },
                    { new: true }
                );
                if (lessons) {
                    return {
                        data: lessons,
                        status: TTCSconfig.STATUS_SUCCESS
                    }
                } else {
                    return {
                        data: 'không tồn tại',
                        status: TTCSconfig.STATUS_NO_EXIST
                    }
                }
            } catch (error) {
                throw new BadRequestError();
            }
        } else {
            // create
            try {
                const newLesson = await LessonModel.create({
                    ...body,
                    createDate: Date.now(),
                    updateDate: Date.now(),
                })
                return {
                    data: newLesson,
                    status: TTCSconfig.STATUS_SUCCESS
                }
            } catch (error) {
                throw new BadRequestError();
            }
        }
    }
}