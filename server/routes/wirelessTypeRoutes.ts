import express, {Router} from 'express'

const routes: Router = express.Router()

import WirelessTypeController from "../controller/wirelessTypeController";

routes.post('/', WirelessTypeController.create)
routes.get('/', WirelessTypeController.getAll)

export default routes