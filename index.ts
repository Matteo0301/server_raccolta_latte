import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import cors from 'cors'
import Helmet from "helmet"
import https from 'https'
import fs from 'fs'
import morganMiddleware from './lib/morganMiddleware'
import Logger from './lib/logger'
import './lib/token'
import { authenticateToken, generateAccessToken, setSecret } from './lib/token'
import { connect, deleteUser } from './lib/database'
import { authenticateUser, checkAdmin } from './lib/auth'
import { addUser, getUser, getUsers, updateUser } from './lib/database'
import { randomBytes } from 'crypto'


dotenv.config()


const app: Express = express()
const port = process.env.PORT


const CONNECTION_STRING = process.env.CONNECTION_STRING || "mongodb://user:password@127.0.0.1:27017/raccolta_latte?authSource=raccolta_latte"
const DATABASE = 'raccolta_latte'

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(Helmet())
app.use(morganMiddleware)


app.get('/auth/:username/:password', authenticateUser, (req: Request, res: Response) => {
    Logger.debug('Authentication')
    Logger.debug("username " + req.user + ', admin: ' + req.admin)
    const token = generateAccessToken(req.user, req.admin)
    res.json(token)
})

app.get('/api', authenticateToken, (req: Request, res: Response) => {
    res.json({ message: 'Hello from a private endpoint! You need to be authenticated to see this.' })
})

app.post('/api/user', [authenticateToken, checkAdmin], async (req: Request, res: Response) => {
    if (req.body.username === null || req.body.password === null || req.body.admin === null) {
        res.sendStatus(400)
        return
    }
    const username = req.body.username
    const password = req.body.password
    const admin = req.body.admin
    Logger.debug('Adding user ' + username + ' with password ' + password + ' and admin ' + admin)
    await addUser(username, password, admin)
    res.status(201).send('/api/user/' + username)
})

app.get('/api/user', [authenticateToken, checkAdmin], async (req: Request, res: Response) => {
    const users = await getUsers()
    res.json(users)
})

app.patch('/api/user/:username', [authenticateToken, checkAdmin], async (req: Request, res: Response) => {
    if (!req.body.password && !req.body.admin) {
        res.sendStatus(400)
        return
    }

    const user = await getUser(req.params.username)

    if (!user) {
        res.sendStatus(404)
        return
    }

    const password = (req.body.password !== null) ? req.body.password : user.password
    const admin = (req.body.admin !== null) ? req.body.admin : user.admin
    Logger.debug('Updating user ' + req.params.username + ' with password ' + password + ' and admin ' + admin)
    await updateUser(req.params.username, password, admin)
    res.status(204).send()
})

app.delete('/api/user/:username', [authenticateToken, checkAdmin], async (req: Request, res: Response) => {
    const user = await getUser(req.params.username)

    if (!user) {
        res.sendStatus(404)
        return
    }

    Logger.debug('Deleting user ' + req.params.username)
    await deleteUser(req.params.username)
    res.status(204).send()
})

https.createServer(
    {
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem')
    },
    app
).listen(port, async () => {

    await connect(CONNECTION_STRING, DATABASE)
    const random_secret = randomBytes(64).toString('hex');
    let secret = process.env.TOKEN_SECRET as string || random_secret
    setSecret(secret)


    Logger.info("MongoDB connection successful")
    Logger.info(`⚡️[server]: Server is running at http://localhost:${port}`)
});