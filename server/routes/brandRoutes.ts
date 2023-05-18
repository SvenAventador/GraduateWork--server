import express, {Router} from 'express'

const routes: Router = express.Router()

import BrandController from "../controller/brandController";

routes.post('/', BrandController.create)
routes.get('/', BrandController.getAll)
routes.put('/', BrandController.updateBrand)
routes.get('/:id', BrandController.getOne)
routes.delete('/', BrandController.deleteBrand)

export default routes