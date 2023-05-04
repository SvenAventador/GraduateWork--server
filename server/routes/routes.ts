import express, {Router} from 'express'

import brandRoutes from './brandRoutes'
import cartRoutes from './cartRoutes'
import deviceRoutes from './deviceRoutes'
import orderRoutes from './orderRoutes'
import ratingRoutes from './ratingRoutes'
import typeRoutes from './typeRoutes'
import userRoutes from './userRoutes'
import colorRoutes from './colorRoutes'
import materialRoutes from './materialRoutes'
import wirelessTypeRoutes from "./wirelessTypeRoutes";

const routes:Router = express.Router()

routes.use('/brand', brandRoutes)
routes.use('/cart', cartRoutes)
routes.use('/device', deviceRoutes)
routes.use('/order', orderRoutes)
routes.use('/rating', ratingRoutes)
routes.use('/type', typeRoutes)
routes.use('/color', colorRoutes)
routes.use('/material', materialRoutes)
routes.use('/wireless', wirelessTypeRoutes)
routes.use('/user', userRoutes)

export default routes
