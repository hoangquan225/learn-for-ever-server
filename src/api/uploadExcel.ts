import multer from "multer";
// import readXlsxFile from "read-excel-file/node";
import express from "express";
import asyncHandler from '../utils/async_handle';
import logger from "../utils/logger";
import { BadRequestError } from "../common/errors";
import excelToJson from "convert-excel-to-json";
import fs from "fs-extra";

const uploadFileXlsRouter = express.Router();
// const storage = multer.diskStorage({});
// const upload = multer({ storage, limit: { fileSize: 1024 * 1024 * 100 }, dest: "uploads/" }) //limit 100MB
const upload = multer({ dest: "uploads/" }) //limit 100MB

uploadFileXlsRouter.post("/read-excel-to-json", upload.single("file"), asyncHandler(async (req: any, res) => {
    try {
        console.log(req.file);
        if(req.file?.filename == null || req.file?.filename == "undefined"){
            throw res.json(new BadRequestError())
        } else {
            var filePath = "uploads/" + req.file.filename
            const excelData = excelToJson({
                sourceFile: filePath,
                header: { 
                    rows: 1
                },
                columnToKey: {
                    "*":"{{columnHeader}}",
                }
            })
            console.log(excelData);
            fs.remove(filePath)
            res.status(200).json(excelData)
        }
    } catch (error) {
        console.log(error);
        throw res.json(new BadRequestError())
    }
}))

// uploadFileXlsRouter.post(
//   "/upload-file-xls",
//   multer.single("file"),
//   asyncHandler(async (req: any, res) => {
//     if (!req.file) {
//       res.status(400).send("No file uploaded.");
//       return;
//     }
//     logger.debug('file', req.file);
//     const buffer = new Uint8Array(req.file.buffer);
//     readXlsxFile(buffer, { type: "buffer" }).then((rows: any[]) => {
//       logger.debug('rows', rows);
//       rows.shift();
//       const tutorials: any[] = [];
//       rows.forEach((row) => {
//         logger.debug('row', row);
//         tutorials.push({
//           id: row[0],
//           title: row[1],
//           description: row[2],
//           published: row[3],
//         });
//       });
//     });
//   })
// );

// var storage = multer.diskStorage({ 
//     destination: function (req, file, cb) {
//         cb(null, './uploads/')
//     },
//     filename: function (req, file, cb) {
//         var datetimestamp = Date.now();
//         cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
//     }
// });

// var upload = multer({ //multer settings
//     storage: storage,
//     fileFilter : function(req, file, callback) { //file filter
//         if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
//             return callback(new Error('Wrong extension type'));
//         }
//         callback(null, true);
//     }
// }).single('file');

// uploadFileXlsRouter.post('/upload', function(req: any, res) {
//     var exceltojson;
//     upload(req,res,function(err){
//         if(err){
//              res.json({error_code:1,err_desc:err});
//              return;
//         }
//         if(!req.file){
//             res.json({error_code:1,err_desc:"No file passed"});
//             return;
//         }
//         if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
//             exceltojson = xlsxtojson;
//         } else {
//             exceltojson = xlstojson;
//         }
//         try {
//             exceltojson({
//                 input: req.file.path,
//                 output: null,
//                 lowerCaseHeaders:true
//             }, function(err,result){
//                 if(err) {
//                     return res.json({error_code:1,err_desc:err, data: null});
//                 } 
//                 res.json({error_code:0,err_desc:null, data: result});
//             });
//         } catch (e){
//             res.json({error_code:1,err_desc:"Corupted excel file"});
//         }
//     })
// }); 

export { uploadFileXlsRouter };