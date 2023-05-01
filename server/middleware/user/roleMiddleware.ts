import {NextFunction, Request, Response} from "express";
import ErrorHandler from "../../error/errorHandler";
import jwt, {JwtPayload} from "jsonwebtoken";
import {ICustomRequest} from "./authMiddleware";

export default function (role: string) {
    return function (req: Request & ICustomRequest, res: Response, next: NextFunction) {
        if (req.method === "OPTIONS") {
            next()
        }

        try {
            const token = req.headers?.authorization?.split(' ')[1]

            if (!token) {
                return next(ErrorHandler.unauthorized("Данный пользователь не авторизован!"))
            }

            const verifiedToken = jwt.verify(token, process.env.JWT_SECRET_KEY!) as JwtPayload
            if (verifiedToken.userRole !== role) {
                return next(ErrorHandler.forbidden("У вас нет прав для данной функции!"))
            }

            req.user = verifiedToken
            next()
        } catch(error) {
            return next(ErrorHandler.unauthorized("Данный пользователь не авторизован"))
        }

    }
}