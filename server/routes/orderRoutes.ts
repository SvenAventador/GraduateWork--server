import express, {Router} from 'express'
import OrderController from "../controller/orderController";

const routes: Router = express.Router()

routes.post('/', OrderController.create)
routes.get('/user-order', OrderController.getAllUserOrder)
routes.get('/fullPrice', OrderController.getAllPrice)
routes.post('/order-update', OrderController.getOneOrder)
routes.get('/:id', OrderController.getAll)

export default routes