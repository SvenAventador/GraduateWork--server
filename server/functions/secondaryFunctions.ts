import jwt from 'jsonwebtoken'

export interface IUser {
    id: number;
    userName: string;
    userEmail: string;
    userRole: string;
    userFio: string | null;
    userAddress: string | null;
    userPhone: string | null;
}

class SecondaryFunctions {

    /**
     * Проверить, является ли параметр "value" строкой.
     * @param value - параметр для проверки.
     * @returns {boolean} - true - строка / false - не строка.
     */
    static isString(value: unknown): value is string {
        return ((typeof (value) === "string") ||
            (value instanceof String))
    }

    /**
     * Проверять, является ли переменная "value" пустой.
     * @param value - параметр для проверки.
     * @returns {boolean} - true - пустая / false - не пустая.
     */
    static isEmpty(value: unknown): boolean {
        return this.isString(value) &&
            value.trim().length === 0
    }

    /**
     * Проверить, является ли объект пустым.
     * @param value - параметр для проверки.
     * @returns {boolean} - true - пустой, false - не пустой.
     */
    static isEmptyObject(value: unknown): value is Record<any, any> {
        return typeof value === 'object' && value !== null && !Object.keys(value).length;
    }

    /**
     * Проверять, является ли переменная "value" числом.
     * @param value - параметр для проверки.
     * @returns {boolean} - true - число / false - не число.
     */
    static isNumber(value: unknown): value is number {
        if (typeof value === 'number' && !isNaN(value)) {
            return true;
        } else return typeof value === 'string' && !isNaN(parseInt(value));
    }

    /**
     * Валидация почты. (a@a.a - не сработает).
     * @param email - почта.
     * @returns {boolean} - true - почта валидна / false - почта не валидна.
     */
    static validateEmail(email: unknown): boolean {
        const regex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu

        if (!this.isEmpty(email) && this.isString(email))
            return regex.test(email)
        else return false
    }

    /**
     * Валидация пароля.
     * Пароль должен содержать:
     * 1) Как минимум одну строчную букву.
     * 2) Как минимум одну заглавную букву.
     * 3) Как минимум одну цифру.
     * 4) Размер пароля должен быть от 8 до 15 символов.
     * 5) Раскладка исключительно латиницей.
     * @param password - пароль.
     * @returns {boolean} - true - валидный пароль / false - не валидный пароль.
     */
    static validatePassword(password: unknown): boolean {
        const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;

        if (!this.isEmpty(password) && this.isString(password))
            return regex.test(password)
        else return false
    }

    /**
     * Валидация мобильного телефона.
     * @param phone - телефон.
     * @returns {boolean} - true - валидный телефон / false - не валидный телефон.
     */
    static validatePhone(phone: unknown): boolean {
        const regex = /^(\+7|8)?\s?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;

        if (!this.isEmpty(phone) && this.isString(phone))
            return regex.test(phone)
        else return false
    }

    /**
     * Генерация JsonWebToken.
     * @param user - объект пользователя.
     */
    static generate_jwt = (user: IUser): string => {
        const {
            id,
            userName,
            userEmail,
            userRole,
            userFio,
            userAddress,
            userPhone
        } = user;
        const payload = {
            id,
            userName,
            userEmail,
            userRole,
            userFio,
            userAddress,
            userPhone
        };
        return jwt.sign(
            payload,
            process.env.JWT_SECRET_KEY!,
            {
                expiresIn: '24h'
            }
        )
    }

}

export default SecondaryFunctions