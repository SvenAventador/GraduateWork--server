import {Request, Response, NextFunction} from "express";
import SecondaryFunctions from "../functions/secondaryFunctions";
import ErrorHandler from "../error/errorHandler";
import {Op} from "sequelize";

const {
    Device,
    CartDevice,
    Order,
    OrderDevice,
    DeliveryStatus,
    DeviceImage,
    User
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

            for (let cartDevice of cartCandidate) {
                const devices = await Device.findByPk(cartDevice.deviceId)

                if (devices) {
                    const amount = devices.deviceCount - cartDevice.amountDevice

                    if (amount < 0) {
                        return next(ErrorHandler.badRequest('Недостаточное количество устройств на складе! Пожалуйста, уменьшите количество'));
                    }

                    await Device.update({deviceCount: amount}, {where: {id: devices.id}})
                }
            }

            const deviceWhereAmountZero = await Device.findAll({where: {deviceCount: 0}})
            const deviceIdWhereAmountZero = deviceWhereAmountZero.map((device: any) => device.id)

            const order = await Order.create({
                dateOrder: Date.now(),
                userId: cartId,
                orderPrice: orderPrice,
                deliveryStatusId: 1,
                paymentStatusId: paymentStatusId
            })

            const orderDevices = cartCandidate.map((cartDevice: any) => ({
                deviceId: cartDevice.deviceId,
                orderId: order.id
            }));

            await OrderDevice.bulkCreate(orderDevices)
            await CartDevice.destroy({where: {cartId: cartId}})
            await CartDevice.destroy({where: {deviceId: deviceIdWhereAmountZero}})
            return res.status(200).json({
                message: "Спасибо, что выбрали именно нас!\n" +
                    "С уважением, администрация TechnoWorld ^_^"
            })
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Получение всех заказов определенного пользователя.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const {id} = req.params

            if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id)) {
                return next(ErrorHandler.badRequest("Некорректный идентификатор пользователя!"))
            }

            if (!(await User.findOne({where: {id: id}}))) {
                return next(ErrorHandler.conflict("Пользователя с таким идентификатором не найдено в нашей системе!"))
            }

            const orders = await Order.findAll({
                where: {userId: id},
                order: [['id', 'asc']],
                include: [
                    {
                        model: OrderDevice,
                        include: [
                            {
                                model: Device,
                                include: [
                                    {model: DeviceImage, as: 'images', where: {isMainImage: true}}
                                ]
                            }
                        ]
                    }
                ]
            })

            if (!orders.length) {
                return next(!ErrorHandler.notFound("Заказы не найдены!"))
            }

            return res.json({orders})
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Получение пользователей включая их заказы.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async getAllUserOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await User.findAll({
                order: [['id', 'asc']],
                include: [
                    {
                        model: Order,
                        where: {
                            userId: {
                                [Op.ne]: null
                            }
                        }
                    }
                ]
            })

            return res.json({users})
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Получение заказа и изменение статуса заказа.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async getOneOrder(req: Request, res: Response, next: NextFunction) {
        const {id, deliveryStatusId} = req.body

        try {
            if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id)) {
                return next(ErrorHandler.badRequest('Некорректный идентификатор заказа!'))
            }

            if (!SecondaryFunctions.isNumber(deliveryStatusId) || SecondaryFunctions.isEmpty(deliveryStatusId)) {
                return next(ErrorHandler.badRequest('Некорректный идентификатор статуса заявки!'))
            }

            const candidate = await DeliveryStatus.findOne({where: {id: deliveryStatusId}})
            if (!candidate) {
                return next(ErrorHandler.badRequest('Такого статуса не найдено!'))
            }

            const orderCandidate = await Order.findOne({where: {id: id}})
            await orderCandidate.update({deliveryStatusId: deliveryStatusId})
            return res.status(200).json({message: `Статус доставки заказа под номером ${id} успешно обновлен!`})
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Получение всей выручки
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async getAllPrice(req: Request, res: Response, next: NextFunction) {
        const orders = await Order.findAll()
        let totalCost = 0
        orders.map((item: any) => {
            totalCost += item.orderPrice
        })
        return res.json(totalCost)
    }
}

export default new OrderController()