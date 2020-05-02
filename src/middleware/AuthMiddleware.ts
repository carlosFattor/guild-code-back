import { NextFunction, Response } from "express";
import * as jwt from "jsonwebtoken";
import AuthenticationTokenMissingException from "../exceptions/AuthenticationTokenMissingException";
import WrongAuthenticationTokenException from "../exceptions/WrongAuthenticationTokenException";
import DataStoredInToken from "../types/dataStoredInToken";
import userModel from "../context/user/UserModel";
import Environment from "../Environment";
import RequestWithUser from "types/requestWithUser.interface";

async function authMiddleware(request: RequestWithUser, response: Response, next: NextFunction) {
  const secret = new Environment().getSecret();
  const headers = request.headers;
  if (headers && headers.authorization) {
    try {
      const token = headers.authorization.split(" ")[1];
      const verificationResponse = jwt.verify(token, secret) as DataStoredInToken;
      const id = verificationResponse._id;
      const user = await userModel.findById(id);
      if (user) {
        request.user = user;
        next();
      } else {
        next(new WrongAuthenticationTokenException());
      }
    } catch (error) {
      next(new WrongAuthenticationTokenException());
    }
  } else {
    next(new AuthenticationTokenMissingException());
  }
}

export default authMiddleware;