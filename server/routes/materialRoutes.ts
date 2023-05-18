import express, {Router} from 'express'

const routes: Router = express.Router()

import MaterialController from "../controller/materialController";

routes.get('/', MaterialController.getAll)
routes.post('/', MaterialController.create)
routes.put('/', MaterialController.updateMaterial)
routes.delete('/', MaterialController.deleteMaterial)

export default routes