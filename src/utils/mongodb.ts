import mongoose from "mongoose";
import dotenv from "./dotenv";
import logger from './logger';

dotenv.config();

const {
    DB_HOST = '127.0.0.1',
    DB_PORT = '27017',
    DB_USER = 'duyhung',
    DB_PWD = 'hung6789',
    DB_NAME = 'my_db'
} = process.env;

const DB_URL = `mongodb+srv://duyhung:${DB_PWD}@${DB_USER}.eyz9i9y.mongodb.net/?retryWrites=true&w=majority`;

const connectDatabase = (callback?: () => void) => {
    mongoose
        .connect(DB_URL, {
            dbName: DB_NAME
        })
        .then(() => {
            logger.info("MongoDB connected:", {
                url: DB_URL,
                dbName: DB_NAME
            });
            if (callback) callback();
        })
        .catch((err) => logger.error("MongoDB initial connection error: ", err));

    mongoose.connection.on("error", (err) => {
        console.log("MongoDB error: ", err);
    });
};

export default connectDatabase;
