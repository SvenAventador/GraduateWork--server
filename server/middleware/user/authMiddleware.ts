import {NextFunction, Request, Response} from "express";
import ErrorHandler from "../../error/errorHandler";
import jwt from "jsonwebtoken";

export interface ICustomRequest extends Request {
    user?: any
}

export default function (req: Request & ICustomRequest, res: Response, next: NextFunction) {
    if (req.method === "OPTIONS") {
        next()
    }

    try {
        const authHeader = req.headers.authorization
        const cookieHeader = req.cookies.token

        const [bearer, bearerToken] = authHeader?.split(' ') || []
        const token = bearer === 'Bearer' ? bearerToken : cookieHeader

        if (!token) {
            return next(ErrorHandler.unauthorized("Данный пользователь не авторизован!"))
        }

        if (!token) {
            return next(ErrorHandler.unauthorized("Данный пользователь не авторизован!"))
        }

        req.user = jwt.verify(token, process.env.JWT_SECRET_KEY!) as {user: string}
        
        next()
    } catch(error) {
        console.log(error)
        return next(ErrorHandler.unauthorized("Данный пользователь не авторизован!"))
    }
}


