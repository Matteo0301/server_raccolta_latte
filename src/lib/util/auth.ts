import { Request, Response, NextFunction } from 'express'
import { db, getOrigins, getUser } from '../mongoose'
import { compareSync } from 'bcryptjs'
import Logger from './logger'
import { validationResult } from 'express-validator'



async function authenticateUser(req: Request, res: Response, next: NextFunction) {
    const request_user = req.params.username
    const request_password = req.params.password

    let user = await getUser(request_user)
    if (user && user.password !== undefined && user.password !== null && user.admin !== undefined && user.admin !== null) {
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
        Logger.warn('Login failed: ' + request_user + ' is not in the database')
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

async function checkValidationErrors(req: Request, res: Response, next: NextFunction) {
    const result = validationResult(req)
    if (!result.isEmpty()) {
        res.status(400).json({ errors: result.array() })
    }
    else {
        next()
    }
}

async function checkOrigin(req: Request, res: Response, next: NextFunction) {
    const origin = req.params.origin
    const origins = await getOrigins()
    origins.forEach((o) => {
        if (o.name == origin) {
            next()
        }
    })
    res.sendStatus(400)
}

export { authenticateUser, checkAdmin, checkTokenMatchesUser, checkValidationErrors }