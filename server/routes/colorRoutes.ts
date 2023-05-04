import express, {Router} from 'express'

const routes: Router = express.Router()

import ColorController from "../controller/colorController";

routes.get('/', ColorController.getAll)
routes.post('/', ColorController.create)

export default routes