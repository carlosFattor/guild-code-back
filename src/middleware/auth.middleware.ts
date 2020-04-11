import { NextFunction, Response, Request } from 'express';
import * as jwt from 'jsonwebtoken';
import AuthenticationTokenMissingException from '../exceptions/AuthenticationTokenMissingException';
import WrongAuthenticationTokenException from '../exceptions/WrongAuthenticationTokenException';
import DataStoredInToken from '../types/dataStoredInToken';
import RequestWithUser from '../types/requestWithUser.interface';
import userModel from '../user/UserModel';
import { Environment } from '../Environment'

async function authMiddleware(request: Request, response: Response, next: NextFunction) {
  const secret = new Environment().getSecret();
  const cookies = request.cookies;
  if (cookies && cookies.Authorization) {
    try {
      const verificationResponse = jwt.verify(cookies.Authorization, secret) as DataStoredInToken;
      const id = verificationResponse._id;
      const user = await userModel.findById(id);
      if (user) {
        // request.user = user;
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