import express, {Router} from 'express'

const routes: Router = express.Router()

import DeviceController from "../controller/deviceController";

routes.post('/', DeviceController.create)
routes.put('/:id', DeviceController.calculateMark)
routes.get('/', DeviceController.getAll)
routes.get('/:id', DeviceController.getOne)

export default routes