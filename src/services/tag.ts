import { BadRequestError } from "../common/errors";
import { TagModel } from "../database/tag";
import TTCSconfig from "../submodule/common/config";
import { Tag } from "../submodule/models/tag"

export default class TagService {
    // get 
    getTagsByStatus = async (body: {status: number}): Promise<Tag[]> => {
        try {
            const tags = await TagModel.find({status: body.status})
            return tags
        } catch (error) {
            throw new BadRequestError();
        }
    }

    // get 
    getByIdCategory = async (body: {idCategory: string[], status: number}) => {
        try {
            const tags = await TagModel.find({idCategory: {$all: body.idCategory}, status: body.status})
            // const tags = await TagModel.find({idCategory: body.idCategory, status: body.status})
            return tags
        } catch (error) {
            throw new BadRequestError();
        }
    }

    // update and create
    updateTag = async (body: Tag): Promise<{
        data: Tag | string,
        status: number 
    }> => {
        if (body?.id) {
            // update
            try {
                const tags = await TagModel.findOneAndUpdate(
                    { _id: body?.id },
                    {
                        $set: {
                            ...body,
                            updateDate: Date.now()
                        }
                    },
                    { new: true }
                );
                if(tags) {
                    return {
                        data: tags, 
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
                const newUser = await TagModel.create({
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
}