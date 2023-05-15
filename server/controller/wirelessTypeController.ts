import {NextFunction, Request, Response} from "express";
import SecondaryFunctions from "../functions/secondaryFunctions";
import ErrorHandler from "../error/errorHandler";

const {WirelessType} = require('../models/models')

class WirelessTypeController {

    /**
     * Создание беспроводного устройства.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const {typeName} = req.body

            if (!SecondaryFunctions.isString(typeName) && SecondaryFunctions.isEmpty(typeName)) {
                return next(ErrorHandler.badRequest('Некорректное название беспроводного устройства!'))
            }

            const candidate = await WirelessType.findOne({where: {typeName}})
            if (candidate) {
                return next(ErrorHandler.conflict("Такое название уже есть в системе!"))
            }

            const type = await WirelessType.create({typeName})
            return res.json(type)
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Получение всех типов беспроводных устройствю
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const types = await WirelessType.findAll()
            res.json(types)
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }
}

export default new WirelessTypeController()