import 'express'
import UserService from '../context/user/UserService'

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