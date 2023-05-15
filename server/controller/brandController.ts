import {NextFunction, Request, Response} from "express";
import SecondaryFunctions from "../functions/secondaryFunctions";
import ErrorHandler from "../error/errorHandler";

const {Brand} = require('../models/models');

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

            const brand = await Brand.create({brandName})
            return res.json(brand)
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
            const brands = await Brand.findAll()
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
}

export default new BrandController()