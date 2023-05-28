import {NextFunction, Request, Response} from "express"
import ErrorHandler from "../../error/errorHandler"
import SecondaryFunctions, {IUser} from "../../functions/secondaryFunctions"
import bcrypt from 'bcrypt'
import {UserDto} from "./userDto";
import {ICustomRequest} from "../../middleware/user/authMiddleware";

const {User, Cart, Order} = require('../../models/models')

/**
 * Пользователи магазина.
 */
class UserController {

    /**
     * Регистрация пользователя в системе.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async registration(req: Request, res: Response, next: NextFunction) {
        try {
            const {userName, userEmail, userPassword, roleUser} = req.body

            if ((!(SecondaryFunctions.isString(userName))) || (SecondaryFunctions.isEmpty(userName))) {
                return next(ErrorHandler.badRequest("Некорректно указано имя пользователя."))
            }

            if ((!(SecondaryFunctions.isString(userEmail))) || (SecondaryFunctions.isEmpty(userEmail))) {
                return next(ErrorHandler.badRequest("Некорректно указана почта пользователя."))
            }

            if ((!(SecondaryFunctions.isString(userPassword))) || (SecondaryFunctions.isEmpty(userPassword))) {
                return next(ErrorHandler.badRequest("Некорректно указан пароль пользователя."))
            }

            if (!(SecondaryFunctions.validateEmail(userEmail))) {
                return next(ErrorHandler.badRequest("Введенная Вами почта не валидна."))
            }

            if (!(SecondaryFunctions.validatePassword(userPassword))) {
                return next(ErrorHandler.badRequest("Пароль должен содержать:\n" +
                    "1) Как минимум одну строчную букву.\n" +
                    "2) Как минимум одну заглавную букву.\n" +
                    "3) Как минимум одну цифру.\n" +
                    "4) Размер пароля должен быть от 8 до 15 символов.\n" +
                    "5) Раскладка исключительно латиницей."));
            }

            const nameCandidate = await User.findOne({where: {userName}})
            if (nameCandidate) {
                return next(ErrorHandler.conflict("Пользователь с таким именем уже есть в системе!"))
            }

            const emailCandidate = await User.findOne({where: {userEmail}})
            if (emailCandidate) {
                return next(ErrorHandler.conflict("Пользователь с такой почтой уже есть в системе!"))
            }

            const hashPassword = await bcrypt.hash(userPassword, 5)
            const user = await User.create({userName, userEmail, userPassword: hashPassword, roleUser})
            await Cart.create({userId: user.id})

            const userDto = new UserDto(user.id,
                user.userName,
                user.userEmail,
                user.userRole)

            const token = SecondaryFunctions.generate_jwt(userDto as IUser)

            return res.json({token})
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`))
        }
    }

    /**
     * Авторизация пользователя в системе.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const {userEmail, userPassword} = req.body

            if ((!(SecondaryFunctions.isString(userEmail))) || (SecondaryFunctions.isEmpty(userEmail))) {
                return next(ErrorHandler.badRequest("Некорректно указана почта пользователя."))
            }

            if ((!(SecondaryFunctions.isString(userPassword))) || (SecondaryFunctions.isEmpty(userPassword))) {
                return next(ErrorHandler.badRequest("Некорректно указан пароль пользователя."))
            }

            if (!(SecondaryFunctions.validateEmail(userEmail))) {
                return next(ErrorHandler.badRequest("Введенная Вами почта не валидна."))
            }

            if (!(SecondaryFunctions.validatePassword(userPassword))) {
                return next(ErrorHandler.badRequest("Пароль должен содержать:\n" +
                    "1) Как минимум одну строчную букву.\n" +
                    "2) Как минимум одну заглавную букву.\n" +
                    "3) Как минимум одну цифру.\n" +
                    "4) Размер пароля должен быть от 8 до 15 символов.\n" +
                    "5) Раскладка исключительно латиницей."));
            }

            const user = await User.findOne({where: {userEmail}})
            if (!user) {
                return next(ErrorHandler.badRequest("Пользователь с такой почтой не найден!"));
            }

            const correctPassword = bcrypt.compareSync(userPassword, user.userPassword)
            if (!correctPassword) {
                return next(ErrorHandler.badRequest("Введенный пароль не верен!"))
            }

            const userDto = new UserDto(user.id,
                user.userName,
                user.userEmail,
                user.userRole,
                user.userFio,
                user.userAddress,
                user.userPhone)
            const token = SecondaryFunctions.generate_jwt(userDto as IUser)

            return res.json({token})
        } catch (error) {
            return next(ErrorHandler.internal(`Непредвиденная ошибка: ${error}`))
        }
    }

    /**
     * Проверка того, авторизирован ли пользователь.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async check(req: Request & ICustomRequest, res: Response, next: NextFunction) {
        const userDto = new UserDto(req.user.id,
            req.user.userName,
            req.user.userEmail,
            req.user.userRole,
            req.user.userFio,
            req.user.userAddress,
            req.user.userPhone)
        const token = SecondaryFunctions.generate_jwt(userDto as IUser)

        return res.json({token})
    }

    /**
     * Метод обновления нужных данных пользователю.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;
            const {
                userName,
                userEmail,
                userFio,
                userAddress,
                userPhone
            } = req.body;

            if (!SecondaryFunctions.isNumber(id)) {
                return next(ErrorHandler.badRequest("Неправильный параметр запроса!"));
            }

            if (
                userEmail &&
                (!SecondaryFunctions.isString(userEmail) ||
                    !SecondaryFunctions.validateEmail(userEmail))
            ) {
                return next(ErrorHandler.badRequest("Некорректно введенная почта!"));
            }

            if (
                userFio &&
                (!SecondaryFunctions.isString(userFio) ||
                    userFio.split(" ").length < 2)
            ) {
                return next(ErrorHandler.badRequest("Некорректно введенное ФИО!"));
            }

            if (userAddress && !SecondaryFunctions.isString(userAddress)) {
                return next(ErrorHandler.badRequest("Некорректно введенный адрес!"));
            }

            if (
                userPhone &&
                (!SecondaryFunctions.isString(userPhone) ||
                    !SecondaryFunctions.validatePhone(userPhone))
            ) {
                return next(
                    ErrorHandler.badRequest("Некорректно введенный номер телефона!")
                );
            }

            const candidate = await User.findOne({where: {id}});
            if (!candidate) {
                return next(
                    ErrorHandler.conflict("Такого пользователя не найдено в системе!")
                );
            }

            if (
                userEmail &&
                userEmail !== candidate.userEmail &&
                (await User.findOne({where: {userEmail}}))
            ) {
                return next(
                    ErrorHandler.conflict(
                        "Пользователь с такой почтой уже существует в системе!"
                    )
                );
            }

            if (
                userName &&
                userName !== candidate.userName &&
                (await User.findOne({where: {userName}}))
            ) {
                return next(
                    ErrorHandler.conflict(
                        "Пользователь с таким именем уже существует в системе!"
                    )
                );
            }

            if (
                userPhone &&
                userPhone !== candidate.userPhone &&
                (await User.findOne({where: {userPhone}}))
            ) {
                return next(
                    ErrorHandler.conflict(
                        "Пользователь с таким номером телефона уже существует в системе!"
                    )
                );
            }

            const userToUpdate: Partial<IUser> = {
                userName: userName || candidate.userName,
                userEmail: userEmail || candidate.userEmail,
                userFio: userFio || candidate.userFio,
                userAddress: userAddress || candidate.userAddress,
                userPhone: userPhone || candidate.userPhone,
            };

            await candidate.update(userToUpdate);
            const userDto = new UserDto(
                candidate.id,
                candidate.userName,
                candidate.userEmail,
                candidate.userRole,
                candidate.userFio,
                candidate.userAddress,
                candidate.userPhone
            );
            const token = SecondaryFunctions.generate_jwt(userDto as IUser);

            return res.json({token});
        } catch (error) {
            return next(
                ErrorHandler.internal(`Непредвиденная ошибка: ${error}`)
            );
        }
    }

    /**
     * Клиенты нашего магазина.
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async getCountAllOrder(req: Request, res: Response, next: NextFunction) {

        const usersWithOrders = await Order.findAndCountAll({
            attributes: ['userId'],
            raw: true,
        });

        return res.json({usersWithOrders});
    }
}

export default new UserController()