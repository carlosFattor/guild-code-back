import 'express'
import UserService from '../user/UserService'

export interface RequestServices {
  userService: UserService
}

declare global {
  namespace Express {
    interface Request {
      services: RequestServices
    }
  }
}