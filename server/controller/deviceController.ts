import {NextFunction, Request, Response} from "express";
import SecondaryFunctions from "../functions/secondaryFunctions";
import ErrorHandler from "../error/errorHandler";
import path from 'path'
import {UploadedFile} from "express-fileupload";
import * as crypto from "crypto";
import {Op} from "sequelize";

const {
    Device,
    DeviceInfo,
    DeviceImage,
    Rating,
    FavouriteDevice
} = require('../models/models')

/**
 * Интерфейс для характеристик устройств.
 */
interface IDeviceInfo {
    infoTitle: string;
    infoDescription: string;
}

/**
 * Интерфейс для изображений устройств.
 */
interface IDeviceImage {
    imagePath: string,
}

/**
 * Интерфейс для параметров запроса на получение отсортированных девайсов.
 */
interface IGetOneDeviceQueryParams {
    typeId?: number;
    brandId?: number;
    colorId?: number;
    deviceMaterialId?: number;
    wirelessTypeIds?: string | undefined;
    limit?: number;
    page?: number;
    priceFrom?: number;
    priceTo?: number;
    rating?: number;
    wirelessTypeId?: number;
}

/**
 * Товары магазина.
 */
class DeviceController {

    /**
     * Создание устройства.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            let {
                deviceName,
                devicePrice,
                deviceDescription,
                typeId,
                brandId,
                colorId,
                deviceMaterialId,
                info,
                wirelessTypeId,
            } = req.body

            if ((!SecondaryFunctions.isString(deviceName)) || SecondaryFunctions.isEmpty(deviceName)) {
                return next(ErrorHandler.badRequest('Название товара должно быть в строковой формате и не может быть пустым!'))
            }

            if (!(SecondaryFunctions.isNumber(devicePrice)) || (SecondaryFunctions.isEmpty(devicePrice))) {
                return next(ErrorHandler.badRequest('Цена товара должна быть указана в числовом формате и не может быть пустой!'))
            }

            if (!(SecondaryFunctions.isNumber(typeId)) || (SecondaryFunctions.isEmpty(typeId))) {
                return next(ErrorHandler.badRequest('ID типа должно быть указано в числовом формате и не может быть пустым!'))
            }

            if (!(SecondaryFunctions.isNumber(brandId)) || (SecondaryFunctions.isEmpty(brandId))) {
                return next(ErrorHandler.badRequest('ID бренда должно быть указано в числовом формате и не может быть пустым!'))
            }

            if (!(SecondaryFunctions.isNumber(colorId)) || (SecondaryFunctions.isEmpty(colorId))) {
                return next(ErrorHandler.badRequest('ID цвета должно быть указано в числовом формате и не может быть пустым!'))
            }

            if (!(SecondaryFunctions.isNumber(deviceMaterialId)) || (SecondaryFunctions.isEmpty(deviceMaterialId))) {
                return next(ErrorHandler.badRequest('ID материала корпуса должно быть указано в числовом формате и не может быть пустым!'))
            }

            if (!(SecondaryFunctions.isNumber(wirelessTypeId)) || (SecondaryFunctions.isEmpty(wirelessTypeId))) {
                return next(ErrorHandler.badRequest('ID беспроводного устройства должно быть указано в числовом формате и не может быть пустым!'))
            }


            if (!(SecondaryFunctions.isString(deviceDescription)) || SecondaryFunctions.isEmpty(deviceDescription)) {
                return next(ErrorHandler.badRequest('Описание товара должно быть в строковой формате и не может быть пустым!'))
            }

            const deviceCandidate = await Device.findOne({where: {deviceName}})
            if (deviceCandidate) {
                return next(ErrorHandler.conflict("Данное устройство уже имеется в системе!"));
            }

            const device = await Device.create({
                deviceName,
                devicePrice,
                deviceDescription,
                typeId,
                brandId,
                colorId,
                deviceMaterialId,
                wirelessTypeId
            })

            if (info) {
                const deviceInfo: IDeviceInfo[] = JSON.parse(info)
                await Promise.all(deviceInfo.map(info => {
                    DeviceInfo.create({
                        infoTitle: info.infoTitle,
                        infoDescription: info.infoDescription,
                        deviceId: device.id
                    })
                }))
            }

            const image: UploadedFile[] | UploadedFile | undefined = req.files?.image
            let deviceImage: IDeviceImage[] = []

            if (image && Array.isArray(image)) {
                for (let images of image) {
                    const fileName = crypto.randomBytes(16).toString('hex') + '.jpg';
                    await images.mv(path.resolve(__dirname, '..', 'static', fileName))
                    deviceImage.push({imagePath: fileName})
                }
            }

            if (deviceImage.length > 0) {
                await Promise.all(deviceImage.map((image: IDeviceImage, index: number) =>
                        DeviceImage.create({
                            imagePath: image.imagePath,
                            deviceId: device.id,
                            isMainImage: index === 0
                        })
                    )
                );
            } else if (deviceImage.length <= 0) {
                return next(ErrorHandler.conflict("Пожалуйста, добавьте хотя бы одно изображение устройства!"))
            }

            return res.json(device)
        } catch (error) {
            return next(error)
        }
    }

    /**
     * Добавление устройства в избранное.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async createFavourite(req: Request, res: Response, next: NextFunction) {
        try {
            const {userId, deviceId} = req.params

            if ((!SecondaryFunctions.isNumber(userId)) || SecondaryFunctions.isEmpty(userId)) {
                return next(ErrorHandler.badRequest('Некорректный идентификатор пользователя!'))
            }

            if ((!SecondaryFunctions.isNumber(deviceId)) || SecondaryFunctions.isEmpty(deviceId)) {
                return next(ErrorHandler.badRequest('Некорректный идентификатор пользователя!'))
            }

            const candidate = await Device.findOne({where: {id: deviceId}})
            if (!candidate) {
                return next(ErrorHandler.notFound('Данное устройство не найдено в нашей системе!'))
            }

            const favouriteCandidate = await FavouriteDevice.findOne({where: {deviceId: deviceId}})
            if (favouriteCandidate) {
                return next(ErrorHandler.conflict('Данное устройство есть в списках избранных!'))
            }

            await FavouriteDevice.create({userId, deviceId})
            return res.status(200).json({message: 'Товар успешно добавлен в список избранных!'})
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Высчитывание средней оценки товара.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async calculateMark(req: Request, res: Response, next: NextFunction) {
        try {
            const {id} = req.params

            if (!SecondaryFunctions.isNumber(id)) {
                return next(ErrorHandler.badRequest("Неверный параметр запроса"))
            }

            const deviceCandidate = await Device.findOne({where: {id: id}})
            if (!deviceCandidate) {
                return next(ErrorHandler.badRequest(`Устройство с ID ${id} не найдено!`))
            }

            const markData = await Rating.findAll({where: {deviceId: id}})
            if (markData.length === 0) {
                return next(ErrorHandler.conflict("Данное устройство ни разу не было оценено!"))
            }

            const marks = markData.map((rate: any) => rate.dataValues.rate)

            let resultMark = 0;

            for (let i = 0; i < marks.length; i++) {
                resultMark += marks[i]
            }

            resultMark /= marks.length
            Device.update({rating: resultMark}, {where: {id}}).then(() => {
                return res.status(200).json({message: "Рейтинг успешно обновлен!"})
            })
        } catch (error) {
            return next(error)
        }
    }

    /**
     * Получение всех товаров.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                typeId,
                brandId,
                colorId,
                deviceMaterialId,
                wirelessTypeId,
                limit,
                page,
                priceFrom,
                priceTo,
                rating
            }: IGetOneDeviceQueryParams = req.query;
            let offset: number = 0
            let devices;

            if (limit && page) {
                offset = (Number(page) - 1) * Number(limit)
            }

            let sortCondition = {}

            if (brandId) {
                sortCondition = {...sortCondition, brandId}
            }

            if (typeId) {
                sortCondition = {...sortCondition, typeId}
            }

            if (colorId) {
                sortCondition = {...sortCondition, colorId}
            }

            if (deviceMaterialId) {
                sortCondition = {...sortCondition, deviceMaterialId}
            }

            if (wirelessTypeId) {
                sortCondition = {...sortCondition, wirelessTypeId}
            }

            let orderClause: Array<string | [string, string]> = ['id']

            if (priceFrom && !priceTo) {
                sortCondition = {
                    ...sortCondition,
                    devicePrice: {
                        [Op.gte]: Number(priceFrom)
                    }
                };
                orderClause = [['devicePrice', 'ASC']]
            }

            if (priceTo && !priceFrom) {
                sortCondition = {
                    ...sortCondition,
                    devicePrice: {
                        [Op.lte]: Number(priceTo)
                    }
                };
                orderClause = [['devicePrice', 'ASC']]
            }

            if (priceTo && priceFrom) {
                sortCondition = {
                    ...sortCondition,
                    devicePrice: {
                        [Op.between]: [Number(priceFrom), Number(priceTo)]
                    }
                };
                orderClause = [['devicePrice', 'ASC']]
            }

            if (rating) {
                sortCondition = {
                    ...sortCondition,
                    rating: {
                        [Op.eq]: rating
                    }
                };
                orderClause = [['rating', 'DESC']]
            }

            devices = await Device.findAndCountAll({
                where: sortCondition,
                include: [
                    {model: DeviceImage, as: 'images', where: {isMainImage: true}},
                ],
                order: orderClause,
                limit,
                offset
            })

            return res.json(devices)
        } catch (error) {
            return next(error)
        }
    }

    /**
     * Получение одного товара.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async getOne(req: Request, res: Response, next: NextFunction) {
        const {id} = req.params

        if (!SecondaryFunctions.isNumber(id)) {
            return next(ErrorHandler.badRequest("Неверный параметр запроса"))
        }

        const device = await Device.findOne({
            where: {id},
            include: [
                {model: DeviceInfo, as: 'info'},
                {model: DeviceImage, as: 'images'},
            ]
        })

        return res.json(device)
    }

    /**
     * Удаление одного товара из списка избранных.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async deleteFavourite(req: Request, res: Response, next: NextFunction) {
        try {
            const {userId, deviceId} = req.params

            if ((!SecondaryFunctions.isNumber(userId)) || SecondaryFunctions.isEmpty(userId)) {
                return next(ErrorHandler.badRequest('Некорректный идентификатор пользователя!'))
            }

            if ((!SecondaryFunctions.isNumber(deviceId)) || SecondaryFunctions.isEmpty(deviceId)) {
                return next(ErrorHandler.badRequest('Некорректный идентификатор пользователя!'))
            }

            const candidate = await FavouriteDevice.findOne({where: {userId, deviceId}})
            if (candidate) {
                await candidate.destroy()
                return res.status(200).json({message: 'Товар успешно удален из списка избранных товаров!'})
            } else {
                return next(ErrorHandler.badRequest('Данный товар не найден в списке избраных!'))
            }
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Очистка списка избранных.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async deleteAllFavourite(req: Request, res: Response, next: NextFunction) {
        try {
            const {userId} = req.params

            if ((!SecondaryFunctions.isNumber(userId)) || SecondaryFunctions.isEmpty(userId)) {
                return next(ErrorHandler.badRequest('Некорректный идентификатор пользователя!'))
            }

            const candidate = await FavouriteDevice.findAll({where: {userId}})
            if (candidate.length === 0) {
                return res.status(301).json({message: 'Ваш список избранных пустой!'})
            } else {
                candidate.map((item: any) => {
                    item.destroy()
                    return res.status(200).json({message: 'Ваш список избранных был очищен!'})
                })
            }
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }
}

export default new DeviceController()