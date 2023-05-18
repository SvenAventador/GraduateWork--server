import {NextFunction, Request, Response} from "express";
import SecondaryFunctions from "../functions/secondaryFunctions";
import ErrorHandler from "../error/errorHandler";

const {DeviceMaterial, Device} = require('../models/models')

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
                return next(ErrorHandler.badRequest('Некорректное название материала корпуса устройства!'))
            }

            const candidate = await DeviceMaterial.findOne({where: {materialName}})
            if (candidate) {
                return next(ErrorHandler.conflict('Данное название материала корпуса устройства уже существует в нашей системе!'))
            }

            await DeviceMaterial.create({materialName})
            const materials = await DeviceMaterial.findAll({order: [['id', 'asc']]})
            return res.json(materials)
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
            const material = await DeviceMaterial.findAll({order: [['id', 'asc']]})
            return res.json(material)
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Обновление материала устройств.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async updateMaterial(req: Request, res: Response, next: NextFunction) {
        const {id, materialName} = req.body

        try {
            if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id)) {
                return next(ErrorHandler.badRequest('Некорректный идентификатор материала устройства!'))
            }

            if (!SecondaryFunctions.isString(materialName) || SecondaryFunctions.isEmpty(materialName)) {
                return next(ErrorHandler.badRequest('Некорректное название материала устройства!'))
            }

            const candidate = await DeviceMaterial.findOne({where: {id}})
            if (!candidate) {
                return next(ErrorHandler.badRequest('Такого материала устройства не найдено в системе!'))
            }

            if ((materialName !== candidate.materialName) && await DeviceMaterial.findOne({where: {materialName}})) {
                return next(ErrorHandler.badRequest('Данное название материала устройства уже присутствует в системе!'))
            }

            await candidate.update({materialName: materialName})
            return res.status(200).json({message: 'Данные успешно изменены!'})
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Удаление материала устройств.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async deleteMaterial(req: Request, res: Response, next: NextFunction) {
        const {id} = req.body

        try {

            const candidate = await DeviceMaterial.findOne({where: {id}})
            if (!candidate) {
                return next(ErrorHandler.badRequest('Такого материала не найдено в системе!'))
            }

            const deviceCandidate = await Device.findAll({where: {deviceMaterialId: id}})
            if (deviceCandidate.length === 0) {
                console.log("Устройств с данным типом не найдено!")
            } else {
                deviceCandidate.map((item: any) => {
                    item.destroy()
                    console.log("Устройства успешно удалены!")
                })
            }

            await candidate.destroy()
            const material = await DeviceMaterial.findAll({order: [['id', 'asc']]})
            return res.json(material)
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }
}

export default new DeviceController()