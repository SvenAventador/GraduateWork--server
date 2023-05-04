import {NextFunction, Request, Response} from "express";
import SecondaryFunctions from "../functions/secondaryFunctions";
import ErrorHandler from "../error/errorHandler";
const {Type} = require("../models/models");

/**
 * Типы устройств магаина.
 */
class TypeController {

    /**
     * Создание типа устройства.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const {typeName} = req.body

            if (!(SecondaryFunctions.isString(typeName)) &&
                (SecondaryFunctions.isEmpty(typeName))) {
                return next(ErrorHandler.badRequest("Неправильный параметр запроса!"))
            }

            const candidate = await Type.findOne({where: {typeName}})
            if (candidate) {
                return next(ErrorHandler.conflict("Данное имя уже имеется в системе!"))
            }

            const type = await Type.create({typeName})
            return res.json(type)
        } catch (error) {
            return next(error)
        }
    }

    /**
     * Получение всех типов устройств.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const types = await Type.findAll()
            return res.json(types)
        } catch (error) {
            return next(error)
        }
    }
}

export default new TypeController()