import _ from "lodash"
import moment from "moment"
import { FeedbackModel } from "../database/feedback"
import { UserModel } from "../database/users"

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
}