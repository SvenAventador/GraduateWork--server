import {NextFunction, Request, Response} from "express";
import SecondaryFunctions from "../functions/secondaryFunctions";
import ErrorHandler from "../error/errorHandler";
import path from 'path'
import {UploadedFile} from "express-fileupload";
import * as crypto from "crypto";
import {Model, Op} from "sequelize";

const {
    Device,
    DeviceInfo,
    DeviceImage,
    Rating,
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
 * Интерфейс для параметров запроса на изменение данных устройства.
 */
interface IUpdateDeviceParams {
    id?: number;
    deviceName?: number;
    devicePrice?: number;
    deviceDescription?: number;
    typeId?: number;
    brandId?: number;
    colorId?: number;
    deviceMaterialId?: number;
    wirelessTypeId?: number;
}

/**
 * Интерфейс на опции Include в Sequelize.
 */
interface IncludeOptions {
    model: typeof Model;
    as: string;
    where?: object;
}

/**
 * Поиск определнной опции Include.
 */
interface FindOneOptions {
    where?: object;
    include?: IncludeOptions[];
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

            if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id)) {
                return next(ErrorHandler.badRequest("Некорректное название идентификатора устройства!"))
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

            resultMark = Math.round(resultMark / marks.length);
            await Device.update({rating: +resultMark}, {where: {id}}).then(() => {
                return res.status(200).json({message: "Рейтинг успешно обновлен!"})
            })
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
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
                where: {
                    ...sortCondition
                },
                include: [
                    {model: DeviceImage, as: 'images', where: {isMainImage: true}},
                ],
                order: orderClause,
                limit,
                offset
            })

            const allDevice = await Device.findAll()
            const devicePrice = allDevice.map((device: any) => device.devicePrice)
            const minPrice = Math.min(...devicePrice);
            const maxPrice = Math.max(...devicePrice);

            return res.json(
                {
                    devices,
                    minPrice,
                    maxPrice
                })
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Получение всех товаров.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async getAdminAllDevice(req: Request, res: Response, next: NextFunction) {
        try {
            const devices = await Device.findAll({
                include: [
                    {model: DeviceImage, as: 'images'},
                ],
                order: [['id', 'asc']]
            })
            return res.json(devices)
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Получение одного товара.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;
            const {userId} = req.query;

            if (!SecondaryFunctions.isNumber(id) || SecondaryFunctions.isEmpty(id)) {
                return next(ErrorHandler.badRequest('Некорректно указан идентификатор устройства!'))
            }

            const options: FindOneOptions = {
                where: {id},
                include: [
                    {model: DeviceInfo, as: 'info'},
                    {model: DeviceImage, as: 'images'}
                ],
            };

            if (userId) {
                if (!SecondaryFunctions.isNumber(userId) || SecondaryFunctions.isEmpty(userId)) {
                    return next(ErrorHandler.badRequest('Некорректно указан идентификатор пользователя!'))
                }

                const candidate = await Rating.findOne({
                    where: {
                        deviceId: id,
                        userId: userId
                    }
                })

                if (candidate) {
                    options.include!.push({model: Rating, as: 'ratings', where: {deviceId: id, userId}});
                }
            }

            const device = await Device.findOne(options);
            return res.json(device);
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Обновление одного товара.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                id,
                deviceName,
                devicePrice,
                deviceDescription,
                typeId,
                brandId,
                colorId,
                deviceMaterialId,
                wirelessTypeId
            }: IUpdateDeviceParams = req.body;

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

            const device = await Device.findOne({where: {id}})

            if (!device) {
                return next(ErrorHandler.notFound('Устройство не найдено!'));
            }

            if ((deviceName != device.deviceName) && await Device.findOne({where: {deviceName}})) {
                return next(ErrorHandler.badRequest("Данное название устройства уже есть в системе!"))
            }

            await device.update({
                deviceName,
                devicePrice,
                deviceDescription,
                typeId,
                brandId,
                colorId,
                deviceMaterialId,
                wirelessTypeId
            });

            return res.json(device);
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Удаление одного товара.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async delete(req: Request, res: Response, next: NextFunction) {
        const {id} = req.body

        try {
            const candidate = await Device.findOne({where: {id}})
            if (!candidate) {
                return next(ErrorHandler.badRequest('Такого типа не найдено в системе!'))
            }

            const infoCandidate = await DeviceInfo.findAll({where: {deviceId: id}})
            if (infoCandidate.length === 0) {
                console.log('У устройства нет характеристик!')
            } else {
                infoCandidate.map((item: any) => {
                    item.destroy()
                })
            }

            const imageCandidate = await DeviceImage.findAll({where: {deviceId: id}})
            if (imageCandidate.length === 0) {
                console.log('У устройства нет характеристик!')
            } else {
                imageCandidate.map((item: any) => {
                    item.destroy()
                })
            }
            await candidate.destroy()
            const device = await Device.findAll({order: [['id', 'asc']]})
            return res.json(device)
        } catch {
            return next(ErrorHandler.internal("Произошла ошибка во время выполнения запроса!"))
        }
    }

    /**
     * Получение устройств с каждым рейтингом.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async getCountWithRating (req: Request, res: Response, next: NextFunction) {
        const devices = await Device.findAll({
            attributes: ['rating'],
            raw: true,
        });

        const ratingCounts: Record<number, number> = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
            0: 0,
        };

        devices.forEach((device: any) => {
            const rating = device.rating;
            if (rating in ratingCounts) {
                ratingCounts[rating]++;
            }
        });

        return res.json(ratingCounts);
    }
}

export default new DeviceController()