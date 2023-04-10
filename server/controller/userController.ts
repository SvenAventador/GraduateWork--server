import {NextFunction, Request, Response} from "express";

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
}

export default new UserController()