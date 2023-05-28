import {NextFunction, Request, Response} from "express";
import SecondaryFunctions from "../functions/secondaryFunctions";
import ErrorHandler from "../error/errorHandler";

const {Brand, Device} = require('../models/models');

/**
 * Бренды магазина.
 */
class BrandController {

    /**
     * Создание бренда.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const {brandName} = req.body

            if (!(SecondaryFunctions.isString(brandName)) &&
                (SecondaryFunctions.isEmpty(brandName))) {
                return next(ErrorHandler.badRequest("Некорректное название бренда устройства!"))
            }

            const candidate = await Brand.findOne({where: {brandName}})
            if (candidate) {
                return next(ErrorHandler.conflict("Данное имя уже имеется в системе!"))
            }

            await Brand.create({brandName})
            const brands = await Brand.findAll({order: [['id', 'asc']]})
            return res.json(brands)
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Получение всех брендов.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const brands = await Brand.findAll({order: [['id', 'asc']]})
            return res.json(brands)
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Получение одного бренда.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async getOne(req: Request, res: Response, next: NextFunction) {
        const {id} = req.params

        if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id)) {
            return next(ErrorHandler.badRequest("Некорректный идентификатор бренда устройства!"))
        }

        await Brand.findOne({where: {id}})
            .then((brand: object) => {
                if (!brand) {
                    return next(ErrorHandler.badRequest(`Бренд с ID равным ${id} не найден!`));
                }
                return res.json(brand)
            })
            .catch((error: unknown) => {
                if (error instanceof Error) {
                    return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
                } else {
                    return next(ErrorHandler.internal("Неизвестная ошибка!"))
                }
            })
    }

    /**
     * Обновление бренда устройств.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async updateBrand(req: Request, res: Response, next: NextFunction) {
        const {id, brandName} = req.body

        try {
            if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id)) {
                return next(ErrorHandler.badRequest('Некорректный идентификатор бренда устройства!'))
            }

            if (!SecondaryFunctions.isString(brandName) || SecondaryFunctions.isEmpty(brandName)) {
                return next(ErrorHandler.badRequest('Некорректное название бренда устройства!'))
            }

            const candidate = await Brand.findOne({where: {id}})
            if (!candidate) {
                return next(ErrorHandler.badRequest('Такого бренда устройства не найдено в системе!'))
            }

            if ((brandName !== candidate.brandName) && await Brand.findOne({where: {brandName}})) {
                return next(ErrorHandler.badRequest('Данное название бренда устройства уже присутствует в системе!'))
            }

            await candidate.update({brandName: brandName})
            return res.status(200).json({message: 'Данные успешно изменены!'})
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Удаление бренда устройств.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async deleteBrand(req: Request, res: Response, next: NextFunction) {
        const {id} = req.body

        try {
            const candidate = await Brand.findOne({where: {id}})
            if (!candidate) {
                return next(ErrorHandler.badRequest('Такого бренда не найдено в системе!'))
            }

            await candidate.destroy()
            const brands = await Brand.findAll({order: [['id', 'asc']]})
            return res.json(brands)
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Получение количества брендов.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async getCountAll (req:Request, res: Response, next: NextFunction) {
        const brands = await Brand.findAndCountAll()
        return res.json(brands)
    }
}

export default new BrandController()