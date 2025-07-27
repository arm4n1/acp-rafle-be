import { NextFunction, Request, Response } from "express";
import { getUserData, IUserToken } from "../utils/jwt";

export interface IReqUser extends Request {
  user?: IUserToken;
}

export default (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(403).json({
      message: "unauthorized",
      data: null,
    });
  }

  const [prefix, accessToken] = token.split(" ");

  if (!(prefix === "Bearer" && accessToken)) {
    return res.status(403).json({
      message: "unauthorized",
      data: null,
    });
  }

  const user = getUserData(accessToken);

  if (!user) {
    return res.status(403).json({
      message: "unauthorized",
      data: null,
    });
  }

  (req as IReqUser).user = user;

  next();
};
