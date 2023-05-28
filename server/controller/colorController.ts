import {NextFunction, Request, Response} from "express";
import SecondaryFunctions from "../functions/secondaryFunctions";
import ErrorHandler from "../error/errorHandler";
const {Color, Device} = require('../models/models')

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

            await Color.create({
                colorName,
                hexValue
            })

            const color = await Color.findAll(({order: [['id', 'asc']]}))
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

    /**
     * Обновление цвета устройства.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async updateColor(req: Request, res: Response, next: NextFunction) {
        const {id, colorName, hexValue} = req.body

        const firstVariant = /^#[\d\w]{6}$/;
        const secondVariant = /^#[\d\w]{3}$/

        try {
            if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id)) {
                return next(ErrorHandler.badRequest('Некорректный идентификатор цвета устройства!'))
            }

            if (!SecondaryFunctions.isString(colorName) || SecondaryFunctions.isEmpty(colorName)) {
                return next(ErrorHandler.badRequest('Некорректное название цвета устройства!'))
            }

            if (!SecondaryFunctions.isString(hexValue) || SecondaryFunctions.isEmpty(hexValue)) {
                return next(ErrorHandler.badRequest('Некорректное название hex-значения цвета устройства!'))
            }

            if (!firstVariant.test(hexValue) && !secondVariant.test(hexValue)) {
                return next(ErrorHandler.conflict('Формат данного параметра должен быть следующим: "#______" либо "#___"'))
            }

            const candidate = await Color.findOne({where: {id}})
            if (!candidate) {
                return next(ErrorHandler.badRequest('Такого цвета устройства не найдено в системе!'))
            }

            if (((colorName !== candidate.colorName) && await Color.findOne({where: {colorName}}))) {
                return next(ErrorHandler.badRequest('Данное название цвета устройства уже присутствует в системе!'))
            }

            if (((hexValue !== candidate.hexValue) && await Color.findOne({where: {hexValue}}))) {
                return next(ErrorHandler.badRequest('Данное название цвета устройства уже присутствует в системе!'))
            }

            await candidate.update({colorName: colorName, hexValue: hexValue})
            return res.status(200).json({message: 'Данные успешно изменены!'})
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Удаление цвета устройств.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async deleteColor(req: Request, res: Response, next: NextFunction) {
        const {id} = req.body

        try {

            const candidate = await Color.findOne({where: {id}})
            if (!candidate) {
                return next(ErrorHandler.badRequest('Такого цвета не найдено в системе!'))
            }

            await candidate.destroy()
            const colors = await Color.findAll({order: [['id', 'asc']]})
            return res.json(colors)
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }
}

export default new ColorController()