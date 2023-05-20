import { sign, verify } from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import { Request, Response, NextFunction } from 'express'
import Logger from './logger'


//let secret = randomBytes(64).toString('hex');
let secret = process.env.TOKEN_SECRET || 'secret'

interface RequestInterface extends Request {

}

function generateAccessToken(username: String) {
    return sign({ username: username }, secret, { expiresIn: '24h' })
}

function authenticateToken(req: Request, res: Response, next: NextFunction) {
    //const authHeader = req.headers['authorization']
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE2ODQ1ODc0MzIsImV4cCI6MTY4NDY3MzgzMn0.2CEqBdhrB4I_vW-8TlEUn7lwwR1DLzTaBaENabAOoos';

    if (token == null) {
        Logger.info('Token is null')
        return res.sendStatus(401)
    }

    verify(token, secret, (err: any, user: any) => {



        if (err) {
            Logger.error(err)
            Logger.info('Authentication failed')
            return res.sendStatus(403)
        }

        req.user = user.username
        Logger.debug(req.user)

        next()
    })
}

export { generateAccessToken, authenticateToken }