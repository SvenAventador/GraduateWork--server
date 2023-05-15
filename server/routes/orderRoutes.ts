import express, {Router} from 'express'
import OrderController from "../controller/orderController";

const routes: Router = express.Router()

routes.post('/', OrderController.create)

export default routes