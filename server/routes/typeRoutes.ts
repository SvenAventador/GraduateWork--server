import express, {Router} from 'express'

const routes: Router = express.Router()

import TypeController from "../controller/typeController";

routes.post('/', TypeController.create)
routes.get('/',TypeController.getAll)
routes.put('/', TypeController.updateType)
routes.delete('/', TypeController.deleteType)
export default routes