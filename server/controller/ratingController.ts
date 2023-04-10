import {NextFunction, Request, Response} from "express";

/**
 * Создание оценки товара.
 */
class RatingController {

    /**
     * Создание оценки товара.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async createRate(req: Request, res: Response, next: NextFunction) {

    }
}

export default new RatingController()