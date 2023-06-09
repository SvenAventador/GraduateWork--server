import {NextFunction, Request, Response} from "express";
import SecondaryFunctions from "../functions/secondaryFunctions";
import ErrorHandler from "../error/errorHandler";

const {
    Cart,
    Device,
    CartDevice,
    DeviceImage
} = require('../models/models')

/**
 * Корзина пользователя.
 */
class CartController {

    /**
     * Получение корзины по Id.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async getCartId(req: Request, res: Response, next: NextFunction) {
        try {
            const {id} = req.params

            if (!SecondaryFunctions.isNumber(id)) {
                return next(ErrorHandler.badRequest("Некорректный идентификатор корзины!"))
            }

            const cart = await Cart.findOne({where: {id}})
            if (!cart) {
                return next(ErrorHandler.badRequest(`Корзина с ID = ${id} не найдена!`))
            }
            return res.json(cart.dataValues.id)
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Получение всех товаров из корзины..
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async getAllGoods(req: Request, res: Response, next: NextFunction) {
        try {
            const {id} = req.params

            if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id)) {
                return next(ErrorHandler.badRequest("Некорректный идентификатор коризны!"))
            }
            const cart_device = await CartDevice.findAll({where: {cartId: id}})

            if (!cart_device) {
                return next(ErrorHandler.badRequest(`Корзины с ID ${id} не найдено!`))
            }

            const deviceItem = cart_device.map((item: any) => item.deviceId)

            const device = []

            for (let i = 0; i < deviceItem.length; i++) {
                const devices = await Device.findOne({
                    where: {id: deviceItem[i]},
                    include: [{
                        model: DeviceImage, as: 'images',
                        where: {
                            isMainImage: true
                        }
                    }, {
                        model: CartDevice,
                        where: {cartId: id, deviceId: deviceItem[i]}
                    }]
                })
                device.push(devices.dataValues)
            }

            return res.json(device)
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Добавление товара в корзину..
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async createGoods(req: Request, res: Response, next: NextFunction) {
        try {
            const {cartId, deviceId} = req.body

            if (!SecondaryFunctions.isNumber(cartId) || SecondaryFunctions.isEmpty(cartId)) {
                return next(ErrorHandler.badRequest("Некорректный идентфиикатор корзины!"))
            }

            if (!SecondaryFunctions.isNumber(deviceId) || SecondaryFunctions.isEmpty(deviceId)) {
                return next(ErrorHandler.badRequest("Некорректный идентификатор устройства!"))
            }

            const cartCandidate = await Cart.findOne({where: {id: cartId}})
            if (!cartCandidate) {
                return next(ErrorHandler.badRequest(`Корзина с ID ${cartId} не найдена!`))
            }

            const deviceCandidate = await Device.findOne({where: {id: deviceId}})
            if (!deviceCandidate) {
                return next(ErrorHandler.badRequest(`Устройство с ID ${deviceId} не найдено!`))
            }

            const candidate = await CartDevice.findOne({where: {cartId, deviceId}})
            if (candidate) {
                if (deviceCandidate.deviceCount < candidate.amountDevice + 1) {
                    return res.status(409).json({status: 409, message: "Товара больше нет на складе!"})
                }
                await candidate.update({amountDevice: candidate.amountDevice + 1})
                return res.status(200).json({status: 200, message: "Товар успешно добавлен в корзину!"})
            }

            await CartDevice.create({cartId, deviceId})
            return res.status(200).json({message: "Товар успешно добавлен в корзину!"})
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Удаление товара из корзины..
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async deleteItem(req: Request, res: Response, next: NextFunction) {
        try {
            const {cartId, deviceId} = req.params

            if (!SecondaryFunctions.isNumber(cartId) || SecondaryFunctions.isEmpty(cartId)) {
                return next(ErrorHandler.badRequest("Некорректный идентификатор корзины!"))
            }

            if (!SecondaryFunctions.isNumber(deviceId) || SecondaryFunctions.isEmpty(deviceId)) {
                return next(ErrorHandler.badRequest("Некорректный идентификатор устройства!"))
            }

            const cartCandidate = await Cart.findOne({where: {id: cartId}})
            if (!cartCandidate) {
                return next(ErrorHandler.badRequest(`Корзина с ID ${cartId} не найдена!`))
            }

            const candidate = await CartDevice.findOne({where: {cartId, deviceId}})
            if (candidate) {
                await candidate.destroy()
                return res.status(200).json({message: "Товар успешно удален из корзины!"})
            } else {
                return next(ErrorHandler.badRequest(`Товар с ID ${deviceId} не найден!`))
            }
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Очистка корзины.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async deleteAllItems(req: Request, res: Response, next: NextFunction) {
        try {
            const {cartId} = req.params

            if (!SecondaryFunctions.isNumber(cartId) || SecondaryFunctions.isEmpty(cartId)) {
                return next(ErrorHandler.badRequest("Некорректный параметр запроса!"))
            }

            const candidate = await CartDevice.findAll({where: {cartId}})

            if (candidate.length === 0) {
                return next(ErrorHandler.conflict("Данная корзина пуста!"))
            } else {
                candidate.map((item: any) => {
                    item.destroy()
                })
                return res.status(200).json({message: "Корзина успешно очищена!"});
            }
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Обновление колчества товара в корзине.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async updateAmountDevice(req: Request, res: Response, next: NextFunction) {
        const {id, deviceAmount} = req.body

        try {
            const deviceCandidate = await Device.findOne({where: {id: id}})
            const cartDevice = await CartDevice.findOne({where: {deviceId: id}})
            if (!cartDevice) {
                return next(ErrorHandler.badRequest('Данной записи не найдено!'))
            }
            if (deviceCandidate.deviceCount < deviceAmount) {
                return next(ErrorHandler.conflict('Данного товара больше нет на складе!'))
            }

            await cartDevice.update({amountDevice: deviceAmount})

            return res.json({message: "Количество успешно обновлено!" + "Количество: ", deviceAmount})
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }
}

export default new CartController()