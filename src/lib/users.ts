import { Request, Response, Router } from "express";
import { authenticateUser, checkAdmin, checkValidationErrors } from "./util/auth";
import Logger from "./util/logger";
import { authenticateToken, generateAccessToken } from "./util/token";
import { addUser, deleteUser, getUser, getUsers, updateUser } from "./mongoose";
import { param, body, header } from "express-validator"

const router = Router()

router.get('/auth/:username/:password', [
    param('username').notEmpty().isString().isAlpha().escape(),
    param('password').notEmpty().isString(),
    checkValidationErrors,
    authenticateUser
], (req: Request, res: Response) => {
    Logger.debug('Authentication')
    Logger.debug("username " + req.user + ', admin: ' + req.admin)
    const token = { token: generateAccessToken(req.user, req.admin), admin: req.admin }
    res.json(token)
})

router.put('/', [
    body('username').notEmpty().isString().isAlpha().escape(),
    body('password').notEmpty().isString(),
    body('admin').notEmpty().isBoolean(),
    header('authorization').notEmpty().isString(),
    checkValidationErrors,
    authenticateToken,
    checkAdmin
], async (req: Request, res: Response) => {
    if (req.body.username === null || req.body.password === null || req.body.admin === null) {
        res.sendStatus(400)
        return
    }
    const username = req.body.username
    const password = req.body.password
    const admin = req.body.admin
    Logger.debug('Adding user ' + username + ' with password ' + password + ' and admin ' + admin)
    if (await addUser(username, password, admin))
        res.status(201).send('/users/' + username)
    else
        res.status(409).send()
})

router.get('/', [
    authenticateToken,
    checkAdmin
], async (req: Request, res: Response) => {
    const users = await getUsers()
    const r = { users: users }
    res.json(r)
})

router.patch('/:username', [
    param('username').notEmpty().isString().isAlpha().escape(),
    header('authorization').notEmpty().isString(),
    checkValidationErrors,
    authenticateToken,
    checkAdmin
], async (req: Request, res: Response) => {
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

router.delete('/:username', [
    param('username').notEmpty().isString().isAlpha().escape(),
    header('authorization').notEmpty().isString(),
    checkValidationErrors,
    authenticateToken,
    checkAdmin
], async (req: Request, res: Response) => {
    const user = await getUser(req.params.username)

    if (!user) {
        res.sendStatus(404)
        return
    }

    Logger.debug('Deleting user ' + req.params.username)
    await deleteUser(req.params.username)
    res.status(204).send()
})

export default router