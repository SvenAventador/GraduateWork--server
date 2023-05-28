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
                return next(ErrorHandler.badRequest("Некорректное название типа устройства!"))
            }

            const candidate = await Type.findOne({where: {typeName}})
            if (candidate) {
                return next(ErrorHandler.conflict("Данный тип уже имеется в системе!"))
            }

            await Type.create({typeName})
            const types = await Type.findAll({order: [['id', 'asc']]})
            return res.json(types)
        } catch (error) {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
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
            const types = await Type.findAll({order: [['id', 'asc']]})
            return res.json(types)
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
    async updateType(req: Request, res: Response, next: NextFunction) {
        const {id, typeName} = req.body

        try {
            if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id)) {
                return next(ErrorHandler.badRequest('Некорректный идентификатор типа устройства!'))
            }

            if (!SecondaryFunctions.isString(typeName) || SecondaryFunctions.isEmpty(typeName)) {
                return next(ErrorHandler.badRequest('Некорректное название типа устройства!'))
            }

            const candidate = await Type.findOne({where: {id}})
            if (!candidate) {
                return next(ErrorHandler.badRequest('Такого типа устройства не найдено в системе!'))
            }

            if ((typeName !== candidate.typeName) && await Type.findOne({where: {typeName}})) {
                return next(ErrorHandler.badRequest('Данное название типа устройства уже присутствует в системе!'))
            }

            await candidate.update({typeName: typeName})
            return res.status(200).json({message: 'Данные успешно изменены!'})
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Удаление типа устройств.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async deleteType(req: Request, res: Response, next: NextFunction) {
        const {id} = req.body

        try {
            const candidate = await Type.findOne({where: {id}})
            if (!candidate) {
                return next(ErrorHandler.badRequest('Такого типа не найдено в системе!'))
            }

            await candidate.destroy()
            const types = await Type.findAll({order: [['id', 'asc']]})
            return res.json(types)
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Получение количества типов.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async getCountAll (req:Request, res: Response, next: NextFunction) {
        const types = await Type.findAndCountAll()
        return res.json(types)
    }
}

export default new TypeController()