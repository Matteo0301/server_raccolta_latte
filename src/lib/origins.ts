import { Request, Response, Router } from "express"
import { authenticateToken } from "./util/token"
import { checkAdmin, checkValidationErrors } from "./util/auth"
import { param } from "express-validator"
import { addOrigin, deleteOrigin, getOrigins, getCollectionsByOrigin } from "./mongoose"


const router = Router()

router.get('/', [
    authenticateToken,
    checkAdmin,
    checkValidationErrors
], async (req: Request, res: Response) => {
    console.log('hello :>> ');
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
    param('origin').notEmpty().isString().isAlpha().escape(),
    authenticateToken,
    checkAdmin,
    checkValidationErrors
], async (req: Request, res: Response) => {
    if (await deleteOrigin(req.params.origin))
        res.sendStatus(201)
    else
        res.sendStatus(409)
})

router.post('/:origin', [
    param('origin').notEmpty().isString().isAlpha().escape(),
    authenticateToken,
    checkAdmin,
    checkValidationErrors
], async (req: Request, res: Response) => {
    if (await addOrigin(req.params.origin))
        res.sendStatus(201)
    else
        res.sendStatus(409)
})

export default router