import { sign, verify } from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import { Request, Response, NextFunction } from 'express'
import Logger from './logger'
import { getUser } from './database'

let secret = ""

function generateAccessToken(username: String, admin: boolean) {
    return sign({ username: username, admin: admin }, secret, { expiresIn: '24h' })
}

function setSecret(new_secret: string) {
    secret = new_secret
}

async function authenticateToken(req: Request, res: Response, next: NextFunction) {
    let token
    const header = req.headers['authorization']
    Logger.debug(header)
    if (header && typeof header === 'string') {
        token = header.split(' ')[1]
    } else {
        res.sendStatus(401)
        return;
    }
    //const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIiLCJhZG1pbiI6dHJ1ZSwiaWF0IjoxNjg0NjYyMDYxLCJleHAiOjE2ODQ3NDg0NjF9.jvQLv78byAd_JDJJIciqdpdQVTnW4z0dtHbhPJy8u3s"

    if (token == null) {
        Logger.info('Token is null')
        return res.sendStatus(401)
    }

    verify(token, secret, async (err: any, user: any) => {



        if (err) {
            Logger.error(err)
            Logger.debug('Authentication failed')
            return res.sendStatus(403)
        }

        const db_user = await getUser(user.username)
        if (!db_user) {
            Logger.debug('Authentication failed: ' + user.username + ' is not in the database')
            return res.sendStatus(403)
        }

        req.user = user.username
        req.admin = user.admin
        Logger.info('Authentication successful: ' + req.user)

        next()
    })
}

export { generateAccessToken, authenticateToken, setSecret }