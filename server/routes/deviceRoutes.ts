import express, {Router} from 'express'

const routes: Router = express.Router()

import DeviceController from "../controller/deviceController";

routes.post('/', DeviceController.create)
routes.put('/:id', DeviceController.calculateMark)
routes.get('/', DeviceController.getAll)
routes.get('/admin-device', DeviceController.getAdminAllDevice)
routes.get('/ratingCount', DeviceController.getCountWithRating)
routes.get('/:id', DeviceController.getOne)
routes.put('/', DeviceController.update)
routes.delete('/', DeviceController.delete)

export default routes