import { Router } from 'express'
import imageRouter from './image.js'
import modelRouter from './model.js'
const router = Router()

router.use('/image', imageRouter)
router.use('/model', modelRouter)
export default router