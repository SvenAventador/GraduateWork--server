/**
 * Список кодов-состояния HTTP.
 */
class ErrorHandler extends Error {
    status: number;
    message: string;

    /**
     * Конструктор.
     * @param status - статус-код.
     * @param message - сообщение, после выполнения запроса.
     */
    constructor(status: number, message: string) {
        super();
        this.status = status;
        this.message = message;
    }

    /**
     * "Плохой запрос".
     * Сервер не понимает запрос из-за неверного синтаксиса.
     * @param message - сообщение.
     */
    static badRequest(message: string): ErrorHandler {
        return new ErrorHandler(400, message);
    }

    /**
     * "Не авторизованно".
     * Для получения запрашиваемого ответа нужна аутентификация.
     * @param message - сообщение.
     */
    static unauthorized(message: string): ErrorHandler {
        return new ErrorHandler(401, message);
    }

    /**
     * "Запрещено".
     * У клиента нет прав доступа к содержимому,
     * поэтому сервер отказывается дать надлежащий ответ.
     * @param message - сообщение.
     */
    static forbidden(message: string): ErrorHandler {
        return new ErrorHandler(403, message);
    }

    /**
     * "Не найдено".
     * Сервер не может найти запрашиваемый ресурс.
     * @param message - сообщение.
     */
    static notFound(message: string): ErrorHandler {
        return new ErrorHandler(404, message);
    }


    /**
     * "Внутренняя ошибка сервера".
     * Сервер столкнулся с ошибкой,
     * которую не знает как обработать.
     * @param message - сообщение.
     */
    static internal(message: string): ErrorHandler {
        return new ErrorHandler(500, message);
    }

    /**
     * Конфликт запроса с текущим состоянием сервера.
     * @param message
     */
    static conflict(message: string): ErrorHandler {
        return new ErrorHandler(409, message);
    }
}

export default ErrorHandler