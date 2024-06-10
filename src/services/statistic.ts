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

            const courses = await CourseModel.find({ categoryId: { $in: categoryIds }, status: TTCSconfig.STATUS_PUBLIC });

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
            const query = {}
            const data = (await TopicProgressModel.find(query)).map(o => new TopicProgress(o))
            return null;
        } catch (error) {
            throw new BadRequestError();
        }
    }
}