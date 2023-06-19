import { Request, Response, NextFunction } from 'express'
import { db, getUser } from '../mongoose'
import { compareSync } from 'bcrypt'
import Logger from './logger'
import { get } from 'http'



async function authenticateUser(req: Request, res: Response, next: NextFunction) {
    const request_user = req.params.username
    const request_password = req.params.password

    let user = await getUser(request_user)
    if (user && user.password !== undefined && user.admin !== undefined) {
        if (compareSync(request_password, user.password)) {
            Logger.debug('Login successful for ' + request_user)
            req.user = request_user
            req.admin = user.admin
            next()
        } else {
            Logger.debug('Login failed: wrong password')
            res.sendStatus(401)
        }
    } else {
        Logger.debug('Login failed: ' + request_user + ' is not in the database')
        res.sendStatus(401)
    }
}

async function checkAdmin(req: Request, res: Response, next: NextFunction) {
    if (req.admin) {
        next()
    } else {
        res.sendStatus(403)
    }
}

async function checkTokenMatchesUser(req: Request, res: Response, next: NextFunction) {
    if (!req.admin && req.user !== req.params.username) {
        res.sendStatus(403)
    }
    else {
        next()
    }
}

export { authenticateUser, checkAdmin, checkTokenMatchesUser }