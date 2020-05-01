import RequestWithUser from "types/requestWithUser.interface";
import { NextFunction } from "express";
import RoleException from "exceptions/RoleException";
import { UserRoles } from "domains/UserRoles";

async function rolesMiddleware(request: RequestWithUser, response: Response, next: NextFunction) {
  if (request && request.user) {
    if (request.user.roles?.includes(UserRoles.ADMIN)) {
      next();
    } else {
      next(new RoleException());
    }
  } else {
    next(new RoleException());
  }
}

export default rolesMiddleware;