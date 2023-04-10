import errorHandlerMiddleware from "./middleware/errorHandlerMiddleware";

require('dotenv').config()
import express, {Request, Response} from 'express'
import fileUpload from 'express-fileupload'
import path from "path";
import cors from 'cors'
import cookieParser from 'cookie-parser'

const database = require('./models/db')
const models = require('./models/models')
import routes from './routes/routes'
const PORT = process.env.PORT || 5000

const app = express()
app.use(express.json())
app.use(cors())
app.use(fileUpload())
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(cookieParser())
app.use('/api', routes)

app.use(errorHandlerMiddleware)

app.get('/', (req:Request, res:Response) => {
    res.status(200).json({message: 'WORK'})
})

const start = async() => {
    try {
        await database.authenticate();
        await database.sync();

        return new Promise((resolve, reject) => {
            const server = app.listen(PORT, () => {
                console.log(`Server started on PORT ${PORT}`);
                resolve(server);
            });
            server.on('error', (err: { message: string }) => {
                console.error(`Server find next error: ${err.message}`);
                reject(err);
            });
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error(`Database connection error: ${err.message}`);
            throw err;
        } else {
            console.error(`Unknown error occurred: ${err}`);
            throw new Error('Unknown error occurred');
        }
    }
};

start().then(() => {
    console.log('Server started successfully');
}).catch((err) => {
    console.error(`Failed to start server: ${err.message}`);}
);