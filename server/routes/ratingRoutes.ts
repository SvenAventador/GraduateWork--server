import express, {Router} from 'express'

const routes: Router = express.Router()

import RatingController from "../controller/ratingController";

routes.post('/', RatingController.createRate)

export default routes