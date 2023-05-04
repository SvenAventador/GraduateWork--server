import express, {Router} from 'express'

const routes: Router = express.Router()

import MaterialController from "../controller/materialController";

routes.get('/', MaterialController.getAll)
routes.post('/', MaterialController.create)

export default routes