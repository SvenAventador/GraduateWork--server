import express, {Router} from 'express'

const routes: Router = express.Router()

import UserController from "../controller/user/userController";
import authMiddleware from "../middleware/user/authMiddleware";

routes.post('/registration', UserController.registration)
routes.post('/login', UserController.login)
routes.put('/update/:id', UserController.update)
routes.get('/auth', authMiddleware, UserController.check)

export default routes