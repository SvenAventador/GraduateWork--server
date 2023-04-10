import {NextFunction, Request, Response} from "express";

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

    }

    /**
     * Получение всех товаров из корзины..
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async getAllGoods(req: Request, res: Response, next: NextFunction) {

    }

    /**
     * Добавление товара в корзину..
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async createGoods(req: Request, res: Response, next: NextFunction) {

    }

    /**
     * Удаление товара из корзины..
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async deleteItem(req: Request, res: Response, next: NextFunction) {

    }

    /**
     * Очистка корзины..
     * @param req - запрос.
     * @param res - ответ.
     * @param next - переход к следующей функции.
     */
    async deleteAllItems(req: Request, res: Response, next: NextFunction) {

    }
}

export default new CartController()