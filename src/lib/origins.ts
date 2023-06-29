import { Request, Response, Router } from "express"
import { authenticateToken } from "./util/token"
import { checkAdmin, checkTokenMatchesUser, checkValidationErrors } from "./util/auth"
import { param } from "express-validator"
import { addOrigin, deleteOrigin, getOrigins } from "./mongoose"
import { getOriginalNode } from "typescript"


const router = Router()

router.get('/', [
    authenticateToken,
    checkAdmin,
    checkValidationErrors
], async (req: Request, res: Response) => {
    console.log('hello :>> ');
    res.json(await getOrigins())
})


router.delete('/:origin', [
    param('origin').notEmpty().isString().isAlphanumeric().escape(),
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