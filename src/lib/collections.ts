import { NextFunction, Request, Response, Router } from "express"
import { authenticateToken } from "./util/token"
import { checkAdmin, checkTokenMatchesUser, checkValidationErrors } from "./util/auth"
import { addCollection, addImage, checkCollection, deleteCollection, getCollectionByUser, getCollections, returnImage } from "./mongoose"
import { body, param } from "express-validator"
import { morganMiddleware } from "./util/morganMiddleware"


const router = Router()

async function checkDates(req: Request, res: Response, next: NextFunction) {
    req.start = new Date(req.params.startdate)
    req.end = new Date(req.params.enddate)
    if (isNaN(req.start.getTime()) || isNaN(req.end.getTime())) {
        res.sendStatus(400)
    } else if (req.start > req.end) {
        res.sendStatus(400)
    } else {
        next()
    }
}

router.get('/:startdate/:enddate', [
    param('startdate').notEmpty().isString().isDate().escape(),
    param('enddate').notEmpty().isString().isDate().escape(),
    checkDates,
    authenticateToken,
    checkAdmin
], async (req: Request, res: Response) => {
    const r = await getCollections(req.start, req.end)
    res.json(r)
})

router.get('/byuser/:username/:startdate/:enddate', [
    param('username').notEmpty().isString().escape(),
    param('startdate').isString().isISO8601().isDate().escape(),
    param('enddate').isString().isISO8601().isDate().escape(),
    checkDates,
    authenticateToken,
    checkTokenMatchesUser
    //checkValidationErrors
], async (req: Request, res: Response) => {

    const r = await getCollectionByUser(req.params.username, req.start, req.end)
    res.json(r)
})


router.delete('/:id', [
    param('id').notEmpty().isString().isAlphanumeric().escape(),
    authenticateToken,
    checkAdmin,
    checkValidationErrors
], async (req: Request, res: Response) => {
    const id = req.params.id
    if (!await checkCollection(id)) {
        res.status(404).send()
        return
    }
    await deleteCollection(id)
    res.status(204).send()
})

router.post('/:username/:origin', [
    param('username').notEmpty().isString().escape(),
    param('origin').notEmpty().isString().escape(),
    body('date').isString().isISO8601().escape(),
    body('quantity').notEmpty().isNumeric().escape(),
    body('quantity2').notEmpty().isNumeric().escape(),
    body('image').isBase64().escape(),
    authenticateToken,
    checkTokenMatchesUser,
    checkValidationErrors
], async (req: Request, res: Response) => {
    const user = req.params.username
    const quantity = req.body.quantity
    const quantity2 = req.body.quantity2
    const origin = req.params.origin
    if (quantity < quantity2) {
        res.status(400).send()
        return
    }
    let date = new Date()
    if (req.admin && req.body.date)
        date = new Date(req.body.date)
    await addCollection(date, quantity, quantity2, user, origin)
    if (req.body.image != null && req.body.image != undefined && req.body.image != '')
        await addImage(req.body.image, date)
    res.status(201).send()
})

router.get('/:date', [
    param('date').notEmpty().isString().isISO8601().escape(),
    authenticateToken,
    checkValidationErrors
],
    async (req: Request, res: Response) => {
        returnImage(res, req.params.date)
    }

)

export default router