import { Request, Response, NextFunction } from "express";
import HttpException from "../exceptions/HttpException";
import Environment from "../Environment";

function errorMiddleware(error: HttpException, request: Request, response: Response, next: NextFunction) {
  debugger;
  const status = error.status || 500;
  const message = error.message || "Something went wrong";

  const ENV = new Environment();
  if (ENV.getDevelopmentStatus() && error.stack) {
    console.log({ error: error.stack });
  }
  return response
    .status(500)
    .send({
      message,
      status,
    });
}

export default errorMiddleware;
