import { BadRequestError } from "../common/errors";
import { TopicModel } from "../database/topic";
import TTCSconfig from "../submodule/common/config";
import { Topic } from "../submodule/models/topic"

export default class TopicService {
    // get 
    getTopicsByStatus = async (body: { status: number }): Promise<Topic[]> => {
        try {
            const topics = await TopicModel.find({ status: body.status }).populate('topicChild')
            return topics.map(topic => new Topic(topic))
        } catch (error) {
            throw new BadRequestError();
        }
    }

    getTopicById = async (body: { id: string }) => {
        try {
            const topic = await TopicModel.findOne({ _id: body.id }).populate('topicChild').populate({
                path: "timePracticeInVideo", 
                populate: "idQuestion"
            })
            return new Topic(topic)
        } catch (error) {
            throw new BadRequestError();
        }
    }

    getTopicsByCourse = async (body: {
        idCourse: string,
        type: number,
        parentId: string | null,
        status: number
    }) => {
        try {
            if(body.status) {
                const data = await TopicModel.find({
                    idCourse: body.idCourse,
                    parentId: body.parentId,
                    type: body.type,
                    status: body.status,
                }).populate('topicChild')
                let total = 0
                data.forEach(o => {
                    o.topicChild.map(c => new Topic(c).status === body.status &&  total++)
                })
                return {
                    data: data.map(o => new Topic(o)),
                    total,
                    status: TTCSconfig.STATUS_SUCCESS
                }
            }else{
                const data = await TopicModel.find({
                    idCourse: body.idCourse,
                    parentId: body.parentId,
                    type: body.type,
                }).populate('topicChild')
                let total = 0
                data.forEach(o => {
                    o.topicChild.map(c => new Topic(c).status === body.status &&  total++)
                }) 
                return {
                    data: data.map(o => new Topic(o)),
                    total,
                    status: TTCSconfig.STATUS_SUCCESS
                }
            }
        } catch (error) {
            throw new BadRequestError();
        }
    }
    // update and create
    updateTopic = async (body: Topic) => {
        if (body?.id) {
            // update
            try {
                const topics = await TopicModel.findOneAndUpdate(
                    { _id: body?.id },
                    {
                        $set: {
                            ...body,
                            updateDate: Date.now()
                        }
                    },
                    { new: true }
                );
                if (topics) {
                    const topic = new Topic(topics)
                    // get Topic parent
                    const parentId = topic?.parentId
                    const parent = await TopicModel.findOne({
                        _id: parentId
                    })
                    if (parent) {
                        // update topic child
                        const parentTopic = new Topic(parent)
                        if (!parentTopic?.topicChild.find(o => o.toString() == topic?.id?.toString())) {
                            // nếu topic parent đã có topicChild này rồi thì ko cập nhật nữa
                            await TopicModel.findOneAndUpdate(
                                { _id: parentId },
                                {
                                    $set: {
                                        ...parentTopic,
                                        topicChild: [...parentTopic.topicChild, topic?.id]
                                    }
                                },
                                { new: true }
                            )
                        }
                    }
                    return {
                        data: topic,
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
                const newUser = await TopicModel.create({
                    ...body,
                    createDate: Date.now(),
                    updateDate: Date.now(),
                })
                const parentId = newUser.parentId;
                if (parentId) {
                    const parent = await TopicModel.findOne({
                        _id: parentId
                    })
                    // update parent 
                    if (parent) {
                        const parentTopic = new Topic(parent)
                        await TopicModel.findOneAndUpdate(
                            { _id: parentId },
                            {
                                $set: {
                                    ...parentTopic,
                                    topicChild: [...parentTopic.topicChild, newUser?.id]
                                }
                            },
                            { new: true }
                        )
                    }
                }
                return {
                    data: new Topic(newUser),
                    status: TTCSconfig.STATUS_SUCCESS
                }
            } catch (error) {
                throw new BadRequestError();
            }
        }
    }

    orderTopic = async (body: {
        indexRange: Array<{
            id: string,
            index: number
        }>
    }) => {
        try {
            const idRange = body.indexRange.map(o => o.id)
            const loadTopic = await TopicModel.find({ "_id": idRange })

            const orderTopic = loadTopic.map(topic => new Topic(topic)).map(topic => {
                return {
                    ...topic,
                    index: body?.indexRange?.find(o => o.id === topic.id?.toString())?.index || 0
                }
            })

            const data = await Promise.all(orderTopic.map(order => {
                return TopicModel.findOneAndUpdate(
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
            throw new BadRequestError();
        }
    }
}