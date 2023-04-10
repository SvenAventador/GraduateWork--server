import {NextFunction, Request, Response} from 'express'
import ErrorHandler from "../error/errorHandler"

/**
 * Функция middleware для отправки результата запроса.
 * @param error - Ошибка.
 * @param req - Запрос.
 * @param res - Ответ.
 * @param next - Переход к следующему middleware.
 */
export default function errorHandlerMiddleware(error: Error,
                                               req: Request,
                                               res: Response,
                                               next: NextFunction) {
    if (error instanceof ErrorHandler) {
        return res.status(error.status).json({message: error.message})
    }

    //return res.status(500).json({message: "Непредвиденная ошибка. Статус: 500."})
}