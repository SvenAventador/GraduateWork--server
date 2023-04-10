import {NextFunction, Request, Response} from "express";
import SecondaryFunctions from "../functions/secondaryFunctions";
import ErrorHandler from "../error/errorHandler";
import path from 'path'
import uuid from 'uuid'
import {UploadedFile} from "express-fileupload";
import * as crypto from "crypto";

const {Device, DeviceInfo, DeviceImage, Brand, Type} = require('../models/models')

interface IDeviceInfo {
    infoTitle: string;
    infoDescription: string;
}

interface IDeviceImage {
    imagePath: string
}

interface IGetOneDeviceQueryParams {
    typeId?: number;
    brandId?: number;
    limit?: number;
    page?: number;
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
            let {deviceName, devicePrice, deviceDescription, typeId, brandId, info} = req.body

            if ((!SecondaryFunctions.isString(deviceName)) || SecondaryFunctions.isEmpty(deviceName)) {
                return next(ErrorHandler.badRequest('Название товара должно быть в строковой формате и не может быть пустым!'))
            }

            if(!(SecondaryFunctions.isNumber(devicePrice))) {
                return next(ErrorHandler.badRequest('Цена товара должна быть указана в числовом формате!'))
            }

            if(!(SecondaryFunctions.isNumber(typeId))) {
                return next(ErrorHandler.badRequest('ID типа должно быть указано в числовом формате!'))
            }

            if(!(SecondaryFunctions.isNumber(brandId))) {
                return next(ErrorHandler.badRequest('ID бренда должно быть указано в числовом формате!'))
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
                brandId
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
                await Promise.all(deviceImage.map(image =>
                    DeviceImage.create({
                        imagePath: image.imagePath,
                        deviceId: device.id,
                    })));

                return res.json(device)
            }
        } catch (error) {
            return next(error)
        }
    }

    /**
     * Высчитывание средней оценки товара.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async calculateMark(req: Request, res: Response, next: NextFunction) {
        // TODO
    }

    /**
     * Получение всех товаров.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async getAll(req: Request, res: Response, next: NextFunction) {
        const {typeId, brandId, limit, page}: IGetOneDeviceQueryParams = req.query
        let offset: number = 0
        let devices;

        if (limit && page) {
            offset = (Number(page) - 1) * Number(limit)
        }

        try {
            if (!brandId && !typeId) {
                devices = await Device.findAndCountAll({
                    order: ['id'],
                    limit,
                    offset,
                    include: [
                        {model: DeviceImage, as: 'images'}
                    ]
                })
            }

            if (!brandId && typeId) {
                devices = await Device.findAndCountAll({
                    order: ['id'],
                    where: {typeId},
                    limit,
                    offset,
                    include: [
                        {model: DeviceImage, as: 'images'}
                    ]
                })
            }

            if (brandId && !typeId) {
                devices = await Device.findAndCountAll({
                    order: ['id'],
                    where: {brandId},
                    limit,
                    offset,
                    include: [
                        {model: DeviceImage, as: 'images'}
                    ]
                })
            }

            if (brandId && typeId) {
                devices = await Device.findAndCountAll({
                    order: ['id'],
                    where: {typeId, brandId},
                    limit,
                    offset,
                    include: [
                        {model: DeviceImage, as: 'images'}
                    ]
                })
            }

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

        const device = await Device.findOne({
            where: {id},
            include: [
                {
                    model: DeviceInfo, as: 'info'
                },
                {
                    model: DeviceImage, as: 'images'
                }
            ]
        })

        return res.json(device)
    }
}

export default new DeviceController()