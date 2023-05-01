import express, {Router} from 'express'

const routes: Router = express.Router()

import DeviceController from "../controller/deviceController";

routes.post('/', DeviceController.create)
routes.post('/:userId/:deviceId', DeviceController.createFavourite)
routes.put('/:id', DeviceController.calculateMark)
routes.get('/', DeviceController.getAll)
routes.get('/:id', DeviceController.getOne)
routes.delete('/:userId/:deviceId', DeviceController.deleteFavourite)
routes.delete('/:userId', DeviceController.deleteAllFavourite)

export default routes