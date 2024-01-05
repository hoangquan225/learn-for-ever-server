import { BadRequestError } from "../common/errors";

const { cloudinary } = require('../utils/cloudinary')

class UploadService {
    upload = async (file: any): Promise<string> => {
        try {
            const res = await cloudinary.uploader.upload(file.path, {
                upload_preset: 'image_upload'
            })
            return res.url
        } catch (err) {
            console.log(err);
            
            throw new BadRequestError()
        }
    }

    uploadMultiple = async (files: any): Promise<string[] | null> => {
        try {
            const urls = Promise.all(files.map(async file => {
                const res = await cloudinary.uploader.upload(file.path, {
                    upload_preset: 'image_upload',
                })
                return res.url
            }))
            return urls;
        } catch (err) {
            
            throw new BadRequestError()
        }
    }

    uploadMultipleVideo = async (files: any): Promise<string[] | null> => {
        try {
            const urls = Promise.all(files?.map(async (file: any) => {
                const res = await cloudinary.uploader.upload(file.path, {
                    upload_preset: 'video_upload',
                    resource_type: "video",
                })
                return {
                    url : res.url, 
                    duration : res.duration
                }
            }))
            return urls;
        } catch (err) {
            throw new BadRequestError()
        }
    }
}
export { UploadService }