import {NextFunction, Request, Response} from "express";
import SecondaryFunctions from "../functions/secondaryFunctions";
import ErrorHandler from "../error/errorHandler";

const {Rating, Device, User} = require('../models/models')
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
        try {
            const {userId, deviceId, rate} = req.body

            if  (rate > 5) {
                return next(ErrorHandler.conflict("Рейтинг может быть меньше или равен 5!"))
            }

            if(!(SecondaryFunctions.isNumber(userId)) || SecondaryFunctions.isEmpty(userId)) {
                return next(ErrorHandler.badRequest('Некорректно указан идентификатор пользователя.'))
            }

            if(!(SecondaryFunctions.isNumber(deviceId)) || SecondaryFunctions.isEmpty(deviceId)) {
                return next(ErrorHandler.badRequest('Некорректно указан идентификатор устройства.'))
            }

            if(!(SecondaryFunctions.isNumber(rate)) || SecondaryFunctions.isEmpty(rate)) {
                return next(ErrorHandler.badRequest('Некорректно указан рейтинг устройства.'))
            }

            const userCandidate = await User.findOne({where: {id: userId}})
            if (!userCandidate) {
                return next(ErrorHandler.badRequest(`Пользователя с ID ${userId} не найдено!`))
            }

            const deviceCandidate = await Device.findOne({where: {id: deviceId}})
            if (!deviceCandidate) {
                return next(ErrorHandler.badRequest(`Устройство с ID ${deviceId} не найдено!`))
            }

            const candidate = await Rating.findOne({ where: { userId, deviceId } })
            if (candidate) {
                await Rating.update({ rate }, { where: { id: candidate.id } })
                return res.status(200).json({ message: "Оценка успешно обновлена!" })
            }

            await Rating.create({ rate, userId, deviceId })
            return res.status(200).json({ message: "Оценка успешно поставлена!" })

        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }
}

export default new RatingController()