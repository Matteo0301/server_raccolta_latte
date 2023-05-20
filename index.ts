import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import Helmet from "helmet";
import https from 'https';
import fs from 'fs';
import morganMiddleware from './lib/morganMiddleware';
import Logger from './lib/logger';
import './lib/token'
import { authenticateToken, generateAccessToken } from './lib/token';


dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(Helmet());
app.use(morganMiddleware);



app.get('/auth/:username', (req: Request, res: Response) => {
    Logger.debug('Authentication');
    Logger.debug("username " + req.params.username)
    const token = generateAccessToken(req.params.username);
    res.json(token);
});

app.get('/api', authenticateToken, (req: Request, res: Response) => {
    res.json({ message: 'Hello from a private endpoint! You need to be authenticated to see this.' });
});

https.createServer(
    {
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem')
    },
    app
).listen(port, () => {
    Logger.info(`⚡️[server]: Server is running at http://localhost:${port}`);
});