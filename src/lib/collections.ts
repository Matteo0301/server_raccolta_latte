import { Request, Response, Router } from "express"
import { authenticateToken } from "./util/token"
import { checkAdmin, checkTokenMatchesUser } from "./util/auth"
import { addCollection, checkCollection, deleteCollection, getCollectionByUser, getCollections } from "./mongoose"


const router = Router()

router.get('/', [authenticateToken, checkAdmin], async (req: Request, res: Response) => {
    const r = await getCollections()
    res.json(r)
})

router.get('/:username', [authenticateToken, checkTokenMatchesUser], async (req: Request, res: Response) => {
    const r = await getCollectionByUser(req.params.username)
    res.json(r)
})


router.delete('/:id', [authenticateToken, checkAdmin], async (req: Request, res: Response) => {
    const id = req.params.id
    if (!await checkCollection(id)) {
        res.status(404).send()
        return
    }
    await deleteCollection(id)
    res.status(204).send()
})

router.post('/:username', [authenticateToken, checkTokenMatchesUser], async (req: Request, res: Response) => {
    const user = req.params.username
    const quantity = req.body.quantity
    if (quantity == null || quantity <= 0) {
        res.status(400).send()
        return
    }
    const date = new Date()
    await addCollection(date, quantity, user)
    res.status(201).send()
})

export default router