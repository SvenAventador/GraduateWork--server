import {NextFunction, Request, Response} from "express";
import SecondaryFunctions from "../functions/secondaryFunctions";
import ErrorHandler from "../error/errorHandler";

const {DeviceMaterial} = require('../models/models')

/**
 * Цвета устройств.
 */
class DeviceController {

    /**
     * Создание материала в системе.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const {materialName} = req.body

            if (!SecondaryFunctions.isString(materialName) || SecondaryFunctions.isEmpty(materialName)) {
                return next(ErrorHandler.badRequest('Неправильный парметр запроса!'))
            }

            const candidate = await DeviceMaterial.findOne({where: {materialName}})
            if (candidate) {
                return next(ErrorHandler.conflict('Данный цвет уже создан!'))
            }

            const material = await DeviceMaterial.create({
                materialName
            })

            return res.json(material)
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Получение всех материалов.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const material = await DeviceMaterial.findAll()
            return res.json(material)
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }
}

export default new DeviceController()