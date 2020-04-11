import { Router } from 'express';
import UserController from './UserController';
import BaseRouters from '../types/BaseRouters';
import { UserDto } from './base/UserDto';
import validationMiddleware from '../middleware/ValidationMiddleware';
import authMiddleware from '../middleware/auth.middleware';

export default class UserRouters implements BaseRouters {

  private userController: UserController | null = null;
  private router: Router | null = null;
  path = '/users'

  constructor() {
    this.userController = new UserController();

  }

  setRouter(_router: Router): UserRouters {
    this.router = _router
    return this
  }
  loadRouter(): void {
    this.router?.get(this.path, authMiddleware, async (req, res) => this.userController?.fetchUsers(req, res))
    this.router?.post(this.path, validationMiddleware(UserDto), async (req, res) => this.userController?.addUser(req, res))
    this.router?.delete(`${this.path}/:email`, async (req, res, next) => this.userController?.deleteUser(req, res, next))
    this.router?.post(`${this.path}/github/:access_token`, async (req, res, next) => this.userController?.saveGithubUser(req, res, next))
    // this.router?.put(`${this.path}/:email`)
  }

}
