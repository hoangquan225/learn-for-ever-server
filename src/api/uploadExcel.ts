// import Multer from "multer";
// import readXlsxFile from "read-excel-file/node";
// import express from "express";
// import asyncHandler from '../utils/async_handle';
// import logger from "../utils/logger";

// const uploadFileXlsRouter = express.Router();
// const multer = Multer({
//   storage: Multer.memoryStorage(),
//   limits: {
//     fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
//   },
// });

// uploadFileXlsRouter.post(
//   "/upload-file-xls",
//   multer.single("file"),
//   asyncHandler(async (req, res) => {
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
// uploadFileXlsRouter.post('/upload', function(req, res) {
//     var exceltojson;
//     upload(req,res,function(err){
//         if(err){
//              res.json({error_code:1,err_desc:err});
//              return;
//         }
//         /** Multer gives us file info in req.file object */
//         if(!req.file){
//             res.json({error_code:1,err_desc:"No file passed"});
//             return;
//         }
//         /** Check the extension of the incoming file and 
//          *  use the appropriate module
//          */
//         if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
//             exceltojson = xlsxtojson;
//         } else {
//             exceltojson = xlstojson;
//         }
//         try {
//             exceltojson({
//                 input: req.file.path,
//                 output: null, //since we don't need output.json
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

// export { uploadFileXlsRouter };