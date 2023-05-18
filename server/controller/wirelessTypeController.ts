import {NextFunction, Request, Response} from "express";
import SecondaryFunctions from "../functions/secondaryFunctions";
import ErrorHandler from "../error/errorHandler";

const {WirelessType, Device} = require('../models/models')

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

            await WirelessType.create({typeName})
            const type = await WirelessType.findAll({order: [['id', 'asc']]})
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

    /**
     * Обновление дополнений устройства.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async updateWirelessType(req: Request, res: Response, next: NextFunction) {
        const {id, typeName} = req.body

        try {
            if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id)) {
                return next(ErrorHandler.badRequest('Некорректный идентификатор дополнений устройства!'))
            }

            if (!SecondaryFunctions.isString(typeName) || SecondaryFunctions.isEmpty(typeName)) {
                return next(ErrorHandler.badRequest('Некорректное название дополнений устройства!'))
            }

            const candidate = await WirelessType.findOne({where: {id}})
            if (!candidate) {
                return next(ErrorHandler.badRequest('Такого дополнения устройства не найдено в системе!'))
            }

            if ((typeName !== candidate.typeName) && await WirelessType.findOne({where: {typeName}})) {
                return next(ErrorHandler.badRequest('Данное название материала устройства уже присутствует в системе!'))
            }

            await candidate.update({typeName: typeName})
            return res.status(200).json({message: 'Данные успешно изменены!'})
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Удаление дополнения устройств.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async deleteMaterial(req: Request, res: Response, next: NextFunction) {
        const {id} = req.body

        try {

            const candidate = await WirelessType.findOne({where: {id}})
            if (!candidate) {
                return next(ErrorHandler.badRequest('Такого дополнения не найдено в системе!'))
            }

            const deviceCandidate = await Device.findAll({where: {wirelessTypeId: id}})
            if (deviceCandidate.length === 0) {
                console.log("Устройств с данным типом не найдено!")
            } else {
                deviceCandidate.map((item: any) => {
                    item.destroy()
                    console.log("Устройства успешно удалены!")
                })
            }

            await candidate.destroy()
            const wireless = await WirelessType.findAll({order: [['id', 'asc']]})
            return res.json(wireless)
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }
}

export default new WirelessTypeController()