import {NextFunction, Request, Response} from "express";
import SecondaryFunctions from "../functions/secondaryFunctions";
import ErrorHandler from "../error/errorHandler";
const {Color} = require('../models/models')

/**
 * Цвета устройств.
 */
class ColorController {

    /**
     * Создание цвета в системе.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const {colorName, hexValue} = req.body

            if (!SecondaryFunctions.isString(colorName) || SecondaryFunctions.isEmpty(colorName)) {
                return next(ErrorHandler.badRequest('Некорректное название цвета!'))
            }

            if (!SecondaryFunctions.isString(hexValue) || SecondaryFunctions.isEmpty(hexValue)) {
                return next(ErrorHandler.badRequest('Некорректное хеш-значение цвета!'))
            }

            const firstVariant = /^#[\d\w]{6}$/;
            const secondVariant = /^#[\d\w]{3}$/
            if (!firstVariant.test(hexValue) && !secondVariant.test(hexValue)) {
                return next(ErrorHandler.conflict('Формат данного параметра должен быть следующим: "#______" либо "#___"'))
            }

            const colorCandidate = await Color.findOne({where: {colorName}})
            if (colorCandidate) {
                return next(ErrorHandler.conflict('Данный цвет уже создан!'))
            }

            const hexCandidate = await Color.findOne({where: {hexValue}})
            if (hexCandidate) {
                return next(ErrorHandler.conflict('Данный цвет уже создан!'))
            }

            const color = await Color.create({
                colorName,
                hexValue
            })

            return res.json(color)
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Получение всех цветов.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const color = await Color.findAll()
            return res.json(color)
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }
}

export default new ColorController()