import cookieParser from 'cookie-parser';
import cors from "cors";
import express from "express";
import http, { Server } from "http";
import dotenv from './src/utils/dotenv';
import logger from './src/utils/logger';
import connectDatabase from './src/utils/mongodb';
import { webRouters } from './src/routes/index';
import { initSocket } from './src/socket';
// import { initSocket } from './src/sockets';
// import discordApp from './src/discord/modules/discord'
const PREFIX_API = "/api"
dotenv.config();
class App {
    public app: express.Application;
    public server: Server;
    public port: string | number;
    private config() {
        const NODE_ENV = process.env.NODE_ENV || 'development';
        // this.app.use(helmet());
        this.app.use(cookieParser());
        this.app.use(cors({
            origin: NODE_ENV === 'production' ? (process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',') : true) : true,
            credentials: true,
            allowedHeaders: 'X-PINGOTHER, Content-Type, Authorization, X-Forwarded-For',
            methods: 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS',
            optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
        }));
        this.app.use(express.json({ limit: "50mb" }));
        this.app.use(express.urlencoded({ extended: true, limit: "50mb" }));
    }
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.port = process.env.PORT || 3000;
        this.config();
        this.useAPI();
    }
    private useAPI() {
        console.log('hello');
        // Web
        this.app.use(PREFIX_API, webRouters);
    }
    run() {
        connectDatabase(() => {
            this.server.listen(this.port, () => {
                logger.info(`Server is running on port ${this.port}`);
            });
            initSocket(this.server);
            // if (process.env.DISABLE_DISCORD !== "true") {
            //     discordApp.login()
            //         .then(res => {
            //             console.log(res);
            //         })
            //         .catch(error => {
            //             console.log(error);

            //         })
            // }
        });
    }
    
}
export { App };
