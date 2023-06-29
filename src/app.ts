import express, { Express } from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import cors from 'cors'
import Helmet from "helmet"
import https from 'https'
import fs from 'fs'
import morganMiddleware from './lib/util/morganMiddleware'
import Logger from './lib/util/logger'
import './lib/util/token'
import { setSecret } from './lib/util/token'
import { close, connect } from './lib/mongoose'
import { randomBytes } from 'crypto'
import usersRouter from './lib/users'
import collectionsRouter from './lib/collections'
import originsRouter from './lib/origins'
import mongoose from 'mongoose'
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
dotenv.config()


const app: Express = express()
const port = process.env.PORT || 3000

let server: https.Server | null = null

const CONNECTION_STRING = process.env.CONNECTION_STRING || "mongodb://user:password@mongodb:27017/raccolta_latte?authSource=raccolta_latte"

async function initServer() {

    Logger.info(`⚡️[server]: Server is running at https://localhost:${port}`)
    if (process.env.NODE_ENV === 'production')
        await connect(CONNECTION_STRING)
    const random_secret = randomBytes(64).toString('hex');
    let secret = process.env.TOKEN_SECRET as string || random_secret
    setSecret(secret)
    Logger.info("MongoDB connection successful")
}

async function closeServer() {
    if (server) {
        server.close()
        await close()
        Logger.info('Process terminated successfully')
        process.exit(1)
    }
}

process.on('SIGTERM', closeServer)
process.on('SIGINT', closeServer)
process.on('uncaughtException', closeServer)

mongoose.connection.on('error', async () => {
    Logger.error('MongoDB connection error')
    await closeServer()
}
)

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(Helmet())
app.use(morganMiddleware)
// Apply the rate limiting middleware to all requests
app.use(limiter)

app.use('/users', usersRouter)
app.use('/collections', collectionsRouter)
app.use('/origins', originsRouter)


if (process.env.NODE_ENV === 'production') {
    server = https.createServer(
        {
            key: fs.readFileSync('key.pem'),
            cert: fs.readFileSync('cert.pem')
        },
        app
    ).listen(port, async () => {
        initServer()
    });
}

export { app, initServer as startServer }