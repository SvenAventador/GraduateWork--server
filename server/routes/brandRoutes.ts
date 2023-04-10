import express, {Router} from 'express'

const routes: Router = express.Router()

import BrandController from "../controller/brandController";

routes.post('/', BrandController.create)
routes.get('/', BrandController.getAll)
routes.get('/:id', BrandController.getOne)

export default routes