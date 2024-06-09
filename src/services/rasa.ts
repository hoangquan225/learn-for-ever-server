import moment from "moment";
import { BadRequestError } from "../common/errors";
import { TopicProgressModel } from "../database/topicProgress";
import { TopicProgress } from "../submodule/models/topicProgress";
import TTCSconfig from "../submodule/common/config";
import { CourseModel } from "../database/course";
import { Course } from "../submodule/models/course";
import { CategoryModel } from "../database/category";

export default class RasaService {
    getStatistic = async (body: any) => {
        try {
            const params: any = JSON.parse(body)
            // const course = new Course(await CourseModel.findById(idCourse).populate('idCategory'))
            
            const data = (await TopicProgressModel.find({idUser: params.userId}).populate("idTopic")).map(o => new TopicProgress(o))
            let revertData = data.sort((a: any, b: any) => a.type - b.type).map((e: any) => ({
                message: e.topicInfo.name + (e.type === 2  ? " - kết quả: " + e.score + " điểm": ''),
                type: "text",
                // path: 
                //     e.type === 2 
                //     ? 
                //         `/${course?.category?.slug}/${course?.slug}/de-kiem-tra/${course?.id}-2/${o.idTopic}` 
                //     :
                //         (
                //             o.type === 1 
                //             ? `/${course?.category?.slug}/${course?.slug}/chuong-trinh-hoc/${course?.id}-1` 
                //             : ""
                //         )
            }))

            revertData = [{
                message: "Đây là các môn học và các đề kiểm tra bạn đã học và làm.",
                type: "text"
            }, ...revertData]

            return {
                status: TTCSconfig.STATUS_SUCCESS,
                data: revertData
            }
        } catch (error) {
            console.log(error);
            return {
                data: null,
                status: TTCSconfig.STATUS_FAIL
            }
        }

    }

    getCourseInfo = async (body: any) => {
        try {
            const params: any = JSON.parse(body.params);
            const { grade = 10 } = body
            
            const categorys = await CategoryModel.findOne({
                slug: `lop-${grade}`,
                status: TTCSconfig.STATUS_PUBLIC,
            });
            const course = await CourseModel.find({ 
                idCategory: categorys?.id, 
                status: TTCSconfig.STATUS_PUBLIC
            });
            let revertData: any = course.map((e: any) => ({
                message: e.courseName,
                type: "redict",
                path:`/${categorys?.slug}/${e?.slug}`
            }))

            revertData = [{
                message: categorys?.des + " Ấn vào môn học mà bạn muốn để đến trang học!!!",
                type: "text"
            }, ...revertData]

            return {
                status: TTCSconfig.STATUS_SUCCESS,
                data: revertData
            }
        } catch (error) {
            console.log(error);
            return {
                data: null,
                status: TTCSconfig.STATUS_FAIL
            }
        }

    }
    
}