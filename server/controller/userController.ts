import {NextFunction, Request, Response} from "express"
import ErrorHandler from "../error/errorHandler"
import SecondaryFunctions from "../functions/secondaryFunctions"
import bcrypt from 'bcrypt'

const {User} = require('../models/models')

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
      const {userName, userEmail, userPassword,} = req.body

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
      const user = await User.create()
   }

   /**
    * Авторизация пользователя в системе.
    * @param req - запрос.
    * @param res - ответ.
    * @param next - переход к следующей функции.
    */
   async login(req: Request, res: Response, next: NextFunction) {

   }

   /**
    * Проверка того, авторизирован ли пользователь.
    * @param req - запрос.
    * @param res - ответ.
    * @param next - переход к следующей функции.
    */
   async check(req: Request, res: Response, next: NextFunction) {
       
   }

   /**
    * Выход из аккаунта (Очистка куков).
    * @param req - запрос.
    * @param res - ответ.
    * @param next - переход к следующей функции.
    */
   async logout(req: Request, res: Response, next: NextFunction) {

   }
}

export default new UserController()