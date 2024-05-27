import moment from "moment";
import { BadRequestError } from "../common/errors";
import { CourseModel } from "../database/course";
import { TopicModel } from "../database/topic";
import TTCSconfig from "../submodule/common/config";
import { Course } from "../submodule/models/course";
import { Topic } from "../submodule/models/topic";
import { CategoryModel, categoryTable } from "../database/category";
import e from "cors";

export default class CourseService {
    // get 
    getCoursesByStatus = async (body: {status: number}): Promise<Course[]> => {
        try {
            const courses = await CourseModel.find({status: body.status}).populate('idCategory').sort({ "createDate": -1 })
            const data = courses.filter((e: any) => e.idCategory?.status === 1);
            return data
        } catch (error) {
            throw new BadRequestError();
        }
    }

    getCourseByIdCategory = async (body: { categoryId: string }) => {
        const courses = await CourseModel.find({
            idCategory: body.categoryId,
            status: TTCSconfig.STATUS_PUBLIC
        })
        return {
            status: TTCSconfig.STATUS_SUCCESS,
            data: courses.map(course => new Course(course))
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
            // const query: any = { };
            // query.status = body.status
            // if(body.idTag !== "undefined") {
            //     query.idTag = body.idTag
            // }
            // if(body.idCategory !== "undefined") {
            //     query.idCategory = body.idCategory
            // }
            // const courses = await CourseModel.find(query)

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

    getCoursesBySlug = async (body: {slug: string, status?:number, isInfoTopic?: boolean}) => {
        const {slug, status, isInfoTopic} = body
        try {
            let statusRes = TTCSconfig.STATUS_SUCCESS
            const course = await CourseModel.findOne({
                slug, 
                status
            }).populate('idCategory')
            if(!course) return { data: null, status: TTCSconfig.RESPONSIVE_NULL }

            if(isInfoTopic) {
                const option = await this.getInfoTopicByCourse({idCourse: course?._id})
                return {
                    data: new Course(course), 
                    option,
                    status : statusRes
                }
            }   
            return {
                data: course? new Course(course) : null, 
                status : statusRes
            }
        } catch (error) {
            console.log({error});
            
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

    private secondsToHms(seconds):string {
        const duration = moment.duration(seconds, 'seconds');
        const hours = Math.floor(duration.asHours());
        const minutes = duration.minutes();
        const remainingSeconds = duration.seconds();
    
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
    
        return `${formattedHours}h${formattedMinutes}m${formattedSeconds}s`;
    }

    getInfoTopicByCourse = async (body: { idCourse: string }) => {
        try {
            const lesson = await TopicModel.find({
                idCourse: body.idCourse,
                status: TTCSconfig.STATUS_PUBLIC,
                type: 1,
            }).populate('topicChild')

            const totalLesson = await TopicModel.countDocuments({
                idCourse: body.idCourse,
                status: TTCSconfig.STATUS_PUBLIC,
                type: 1,
                parentId: { $ne: null }
            })
            const totalTest = await TopicModel.countDocuments({
                idCourse: body.idCourse,
                status: TTCSconfig.STATUS_PUBLIC,
                type: 2,
                parentId: { $ne: null }
            })

            const totalTimeInSeconds = lesson?.map(o => new Topic(o))?.map((topic) =>
                topic?.topicChildData.reduce((accumulator, currentValue) => accumulator + Number(currentValue.timeExam), 0)
            ).reduce((accumulator, currentValue) => accumulator + currentValue, 0) || 0;
            
            // const totalTime = moment.duration(totalTimeInSeconds, 'seconds').asHours();
            const totalTime:string = this.secondsToHms(totalTimeInSeconds);

            return { totalLesson, totalTest, totalTime}
        } catch (error) {
            console.log(error);
            throw new BadRequestError();
        }
    }
}