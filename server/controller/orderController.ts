import {Request, Response, NextFunction} from "express";
import SecondaryFunctions from "../functions/secondaryFunctions";
import ErrorHandler from "../error/errorHandler";
const {
    CartDevice,
    Order,
    OrderDevice
} = require('../models/models')

/**
 * Контроллер для работы с заказами.
 */
class OrderController {

    /**
     * Создание заказа.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async create(req: Request, res: Response, next: NextFunction) {
        const {cartId, paymentStatusId, orderPrice} = req.body

        if (!SecondaryFunctions.isNumber(cartId) || SecondaryFunctions.isEmpty(cartId)) {
            return next(ErrorHandler.badRequest('Некорректный идентификатор корзины!'))
        }

        if (!SecondaryFunctions.isNumber(paymentStatusId) || SecondaryFunctions.isEmpty(paymentStatusId)) {
            return next(ErrorHandler.badRequest('Некорректный идентификатор типа оплаты!'))
        }

        if (!SecondaryFunctions.isNumber(orderPrice) || SecondaryFunctions.isEmpty(orderPrice)) {
            return next(ErrorHandler.badRequest('Некорректная сумма заказа!!'))
        }

        try {
            const cartCandidate = await CartDevice.findAll({where: {cartId: cartId}})
            if (!cartCandidate) {
                return res.status(200).json({message: "Корзина пуста!"})
            }

            const order = await Order.create({
                dateOrder: Date.now(),
                userId: cartId,
                orderPrice: orderPrice,
                deliveryStatusId: 1,
                paymentStatusId: paymentStatusId
            })

            const orderDevices = cartCandidate.map((cartDevice:any) => ({
                deviceId: cartDevice.deviceId,
                orderId: order.id
            }));
            await OrderDevice.bulkCreate(orderDevices)
            await CartDevice.destroy({where: {cartId: cartId}})
            return res.status(200).json({message: "Спасибо, что выбрали именно нас!\n" +
                                                             "С уважением, администрация TechnoWorld ^_^"})
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    async getAll (req: Request, res: Response, next: NextFunction) {
        const {userId} = req.query
    }

}

export default new OrderController()