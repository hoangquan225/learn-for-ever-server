import { BadRequestError } from "../common/errors";
import { QuestionModel } from "../database/question";
import TTCSconfig from "../submodule/common/config";
import { Question } from "../submodule/models/question"

export default class QuestionService {
    // get 
    getQuestionsByStatus = async (body: { status: number }): Promise<Question[]> => {
        try {
            const questions = await QuestionModel.find({ status: body.status })
            return questions.map(o => new Question(o))
        } catch (error) {
            throw new BadRequestError();
        }
    }

    getQuestionsByTopic = async (body: { status: number, idTopic: string }) => {
        try {
            const questions = await QuestionModel.find({
                status: body.status, 
                idTopic: body.idTopic
            })
            return questions.map(o => new Question(o))
        } catch (error) {
            throw new BadRequestError();
        }
    }

    deletetQuestions = async (body: { id: string }) => {
        try {
            const deleteQuestions = await QuestionModel.deleteOne({ _id: body.id })
            return deleteQuestions
        } catch (error) {
            throw new BadRequestError();
        }
    }

    // update and create
    updateQuestion = async (body: Question): Promise<{
        data: Question | string,
        status: number
    }> => {
        if (body?.id) {
            // update
            try {
                const questions = await QuestionModel.findOneAndUpdate(
                    { _id: body?.id },
                    {
                        $set: {
                            ...body,
                            updateDate: Date.now()
                        }
                    },
                    { new: true }
                );
                if (questions) {
                    return {
                        data: questions,
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
                const newUser = await QuestionModel.create({
                    ...body,
                    createDate: Date.now(),
                    updateDate: Date.now(),
                })
                return {
                    data: newUser,
                    status: TTCSconfig.STATUS_SUCCESS
                }
            } catch (error) {
                throw new BadRequestError();
            }
        }
    }

    orderQuestion = async (body: {
        indexRange: Array<{
            id: string,
            index: number
        }>
    }) => {
        try {
            const { indexRange } = body
            const idRange = indexRange.map(o => o.id)

            const loadQuestion = await QuestionModel.find({ "_id": idRange })

            const orderQuestion = loadQuestion.map(question => new Question(question)).map(question => {
                return {
                    ...question,
                    index: body?.indexRange?.find(o => o.id === question.id?.toString())?.index || 0
                }
            })

            const data = await Promise.all(orderQuestion.map(order => {
                console.log(order);
                

                return QuestionModel.findOneAndUpdate(
                    { _id: order?.id },
                    {
                        $set: {
                            ...order,
                            updateDate: Date.now()
                        }
                    },
                    { new: true }
                )
            }))

            return {
                status: TTCSconfig.STATUS_SUCCESS
            }
        } catch (error) {
            throw new BadRequestError('khong ton tai')
        }
    }
}