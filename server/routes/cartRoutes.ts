import express, {Router} from 'express'

const routes: Router = express.Router()

import CartController from "../controller/cartController";

routes.get('/:id', CartController.getCartId)
routes.get('/get-all-goods/:id', CartController.getAllGoods)
routes.post('/', CartController.createGoods)
routes.delete('/:cartId/:deviceId', CartController.deleteItem)
routes.delete('/:cartId', CartController.deleteAllItems)

export default routes