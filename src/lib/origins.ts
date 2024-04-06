import { Request, Response, Router } from "express"
import { authenticateToken } from "./util/token"
import { checkAdmin, checkValidationErrors } from "./util/auth"
import { param } from "express-validator"
import { addOrigin, deleteOrigin, getOrigins, getCollectionsByOrigin, updateOrigin, getOrigin } from "./mongoose"


const router = Router()

router.get('/', [
    authenticateToken,
    checkValidationErrors
], async (req: Request, res: Response) => {
    res.json(await getOrigins())
})

router.get('/:origin', [
    param('origin').notEmpty().isString().isAlpha().escape(),
    authenticateToken,
    checkAdmin,
    checkValidationErrors
], async (req: Request, res: Response) => {
    res.json(await getCollectionsByOrigin(req.params.origin))
})


router.delete('/:origin', [
    param('origin').notEmpty().isString().escape(),
    authenticateToken,
    checkAdmin,
    checkValidationErrors
], async (req: Request, res: Response) => {
    if (await deleteOrigin(req.params.origin))
        res.sendStatus(201)
    else
        res.sendStatus(409)
})

router.post('/:origin/:lat/:lng', [
    param('origin').notEmpty().isString().escape(),
    param('lat').notEmpty().isNumeric(),
    param('lng').notEmpty().isNumeric(),
    authenticateToken,
    checkAdmin,
    checkValidationErrors
], async (req: Request, res: Response) => {
    if (await addOrigin(req.params.origin, parseFloat(req.params.lat), parseFloat(req.params.lng)))
        res.sendStatus(201)
    else
        res.sendStatus(409)
})

router.patch('/:origin', [
    param('origin').notEmpty().isString().escape(),
    authenticateToken,
    checkAdmin,
    checkValidationErrors
], async (req: Request, res: Response) => {
    if (!req.body.name && !req.body.lat && !req.body.lng) {
        res.sendStatus(400)
        return
    }

    const origin = await getOrigin(req.params.origin)

    if (!origin) {
        res.sendStatus(404)
        return
    }

    const name = (req.body.name !== null) ? req.body.name : origin.name
    const lat = (req.body.lat !== null) ? req.body.lat : origin.lat
    const lng = (req.body.lng !== null) ? req.body.lng : origin.lng
    if (await updateOrigin(req.params.origin, name, lat, lng))
        res.sendStatus(204)
    else
        res.sendStatus(409)
})

export default router