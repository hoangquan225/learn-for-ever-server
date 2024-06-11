import _ from "lodash"
import moment from "moment"
import { FeedbackModel } from "../database/feedback"
import { UserModel } from "../database/users"
import { CategoryModel } from "../database/category"
import { BadRequestError } from "../common/errors"
import { CourseModel } from "../database/course"
import TTCSconfig from "../submodule/common/config"
import { Category } from "../submodule/models/category"
import { Course } from "../submodule/models/course"
import { TopicProgressModel } from "../database/topicProgress"
import { TopicProgress } from "../submodule/models/topicProgress"

export default class StatisticService {
    loadNumByValueMonth = async (valueMonth: moment.Moment) => {
        const numRegiter = await UserModel.countDocuments({
            registerDate: { $gt: valueMonth.startOf('month').valueOf(), $lt: valueMonth.endOf('month').valueOf() }
        })
        const numLogin = await UserModel.countDocuments({
            lastLogin: { $gt: valueMonth.startOf('month').valueOf(), $lt: valueMonth.endOf('month').valueOf() }
        })
        const numFeedback = await FeedbackModel.countDocuments({
            createDate: { $gt: valueMonth.startOf('month').valueOf(), $lt: valueMonth.endOf('month').valueOf() }
        })

        return {
            numRegiter,
            numLogin,
            numFeedback,
            date: valueMonth.format("MM/YYYY")
        }
    }

    loadStatistic = async (payload: {
        startTime?: number,
        endTime?: number
    }) => {
        const { startTime, endTime } = payload
        
        if (!endTime && startTime) {
            const valueMonth = moment(startTime)
            return [await this.loadNumByValueMonth(valueMonth)]
        } else if (startTime && endTime) {
            const startDate = moment(startTime);
            const endDate = moment(endTime);

            const diffInMs = endDate.diff(startDate);
            const diffInMonths = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30));

            let months: string[] = [];
            for (let i = 0; i <= diffInMonths; i++) {
                months.push(startDate.format('MM/YYYY'));
                startDate.add(1, 'month');
            }

            const data = await Promise.all(months.map(async (month) => {
                return await this.loadNumByValueMonth(moment(month, "MM/YYYY"))
            }))
            return _.orderBy(data, ['date'], "asc")

        }
    }

    getCategoryStatistic = async (status) => {
        try {
            const query: any = {}
            if (status != -2 && status) {
                query.status = status;
            } else {
                query.status = { $ne: -1 }
            }

            const categoryModel = await CategoryModel.find(query).sort({ index: 1 });
            const categories = categoryModel.map(e => new Category(e))
            const categoryIds = categories.map(category => category.id);

            const courses = await CourseModel.find({ idCategory: { $in: categoryIds }, status: TTCSconfig.STATUS_PUBLIC });

            const result = categories.map(category => ({
            ...category,
            courses: courses.filter(course => 
                course.idCategory?.toString() === category.id?.toString()
            ).map(e => new Course(e))
            }));

            return result;
        } catch (error) {
            throw new BadRequestError();
        }
    }

    topicProgressStatistic = async (payload: {
        startTime?: number,
        endTime?: number,
        idCourse?: string,
        idCategory?: string,
    }) => {
        try {
            const { startTime, endTime, idCourse, idCategory } = payload
            if(idCategory) {
                const courses = await CourseModel.find({ idCategory: idCategory, status: TTCSconfig.STATUS_PUBLIC });
                const courseNameMap = courses.reduce((map, course) => {
                    map[course._id] = course.courseName;
                    return map;
                }, {} as Record<string, string>);
    
                const courseIds = courses.map(course => course._id);
    
                const query: any = { idCourse: { $in: courseIds } };
                if (startTime && endTime) query.createdAt = { '$gte': new Date(startTime), '$lte': new Date(endTime) }
    
                const topicProgressData = await TopicProgressModel.find(query);
    
                const courseStatistics = courseIds.reduce((acc, courseId) => {
                    // const courseName = courseNameMap[courseId];
                    // acc[courseName] = topicProgressData.filter((tp: any) => tp.idCourse.equals(courseId)).length;
                    // return acc;
                    const courseName = courseNameMap[courseId];
                    const userIds: string[] = []; 
                    let numUniqueUsers = 0; 
    
                    topicProgressData.forEach((tp: any) => {
                        if (tp.idCourse.equals(courseId) && !userIds.includes(tp.idUser.toString())) {
                            userIds.push(tp.idUser.toString());
                            numUniqueUsers++;
                        }
                    });
                    acc[courseName] = numUniqueUsers;
                    return acc;
                }, {} as Record<string, number>);
                return courseStatistics;
            }

            if(idCourse) {
                const query: any = { idCourse: idCourse };
                if (startTime && endTime) query.createdAt = { '$gte': new Date(startTime), '$lte': new Date(endTime) }
    
                const topicProgressData = await TopicProgressModel.find(query);
                const userIdsLecture: string[] = []; 
                const userIdsTest: string[] = []; 
                let numTest = 0; 
                let numLesson = 0; 

                topicProgressData.forEach((tp: any) => {
                    if (tp.type === 1 && !userIdsLecture.includes(tp.idUser.toString())) {
                        numLesson++;
                        userIdsLecture.push(tp.idUser.toString());
                    } else if (tp.type === 2 && !userIdsTest.includes(tp.idUser.toString())) {
                        numTest++;
                        userIdsTest.push(tp.idUser.toString());
                    }
                });
    
                return  {
                    "Chương trình học": numLesson,
                    "Đề kiểm tra": numTest,
                };
            }
            return null
        } catch (error) {
            console.log(error);
            
            throw new BadRequestError();
        }
    }
}