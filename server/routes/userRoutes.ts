import express, {Router} from 'express'

const routes: Router = express.Router()

import UserController from "../controller/userController";

routes.post('/registration', UserController.registration)
routes.post('/login', UserController.login)
routes.post('/logout', UserController.logout)
routes.get('/auth', /*authMiddleware*/ UserController.check)

export default routes