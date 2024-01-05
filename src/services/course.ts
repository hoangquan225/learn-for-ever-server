import { BadRequestError } from "../common/errors";
import { CourseModel } from "../database/course";
import TTCSconfig from "../submodule/common/config";
import { Course } from "../submodule/models/course";

export default class CourseService {
    // get 
    getCoursesByStatus = async (body: {status: number}): Promise<Course[]> => {
        try {
            const courses = await CourseModel.find({status: body.status})
            return courses
        } catch (error) {
            throw new BadRequestError();
        }
    }

    getCourseById =async (body:{id: string}) => {
        try {
            const course = await CourseModel.findOne({_id : body.id})
            return course
        } catch (error) {
            throw new BadRequestError()
        }
    }

    // get by id tag or category
    getByIdTagAndCategory = async (body: {idCategory: string, idTag: string, status: number}): Promise<Course[]> => {
        
        try {
            if(body.idTag !== "undefined" && body.idCategory !== "undefined") {
                const courses = await CourseModel.find({idTag: body.idTag, idCategory: body.idCategory, status: body.status})
                return courses
            }else if(body.idCategory !== "undefined") {
                const courses = await CourseModel.find({idCategory: body.idCategory, status: body.status})
                return courses
            }else {
                const courses = await CourseModel.find({idTag: body.idTag, status: body.status})
                return courses
            }
        } catch (error) {
            throw new BadRequestError();
        }
    }

    getCoursesBySlug = async (body: {slug: string, status?:number}) => {
        const {slug, status = TTCSconfig.STATUS_PUBLIC} = body
        try {
            let statusRes = TTCSconfig.STATUS_SUCCESS
            const course = await CourseModel.findOne({
                slug, 
                status
            }).populate('idCategory')
            if(!course) statusRes = TTCSconfig.RESPONSIVE_NULL
            return {
                data: course? new Course(course) : null, 
                status : statusRes
            }
        } catch (error) {
            throw new BadRequestError();
        }
    }

    // update and create
    updateCourse = async (body: Course): Promise<{
        data: Course | string,
        status: number 
    }> => {
        if (body?.id) {
            // update
            try {
                const courses = await CourseModel.findOneAndUpdate(
                    { _id: body?.id },
                    {
                        $set: {
                            ...body,
                            updateDate: Date.now()
                        }
                    },
                    { new: true }
                );
                if(courses) {
                    return {
                        data: courses, 
                        status: TTCSconfig.STATUS_SUCCESS
                    }
                } else {
                    return {
                        data: 'không tồn tại' , 
                        status: TTCSconfig.STATUS_NO_EXIST
                    }
                }
            } catch (error) {
                throw new BadRequestError();
            }
        } else {
            // create
            try {
                const newCourse = await CourseModel.create({
                    ...body,
                    createDate: Date.now(),
                    updateDate: Date.now(),
                })
                return {
                    data: newCourse, 
                    status: TTCSconfig.STATUS_SUCCESS
                }
            } catch (error) {
                throw new BadRequestError();
            }
        }
    }
}