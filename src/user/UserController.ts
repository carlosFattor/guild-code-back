/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable no-underscore-dangle */
import * as HttpStatus from "http-status-codes";
import { Request, Response } from "express";
import UserService from "./UserService";
import HttpException from "../exceptions/HttpException";
import UserUtil from "./UserUtils";
import { IUser } from "./base/IUser";

export default class UserController {

  private userService: UserService | null = null;
  private userUtils: UserUtil | null = null;

  constructor() {
    this.userService = new UserService();
    this.userUtils = new UserUtil();
  }

  async fetchUsers(req: Request, res: Response): Promise<void> {
    const data = await this.userService?.getAll();
    res.json(data);
  }

  async addUser(req: Request, res: Response): Promise<void> {
    try {
      const { body } = req;
      const user = await this.userService?.add(body);
      res.status(HttpStatus.CREATED).json(user);
    } catch (error) {
      throw new HttpException(404, "It was impossible create a new user");
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;
      const status = await this.userService?.deleteUser(email);
      if (status && status > 0) {
        res.status(HttpStatus.NO_CONTENT).end();
      } else {
        throw new HttpException(HttpStatus.NOT_FOUND, "User not found");
      }
    } catch (error) {
      res.status(error.status).json(error);
    }
  }

  async saveGithubUser(req: Request, res: Response): Promise<void> {
    try {
      const githubToken = req.params.access_token;

      const token = await this.userService?.getGithubToken(githubToken);

      if (!token) {
        throw new HttpException(HttpStatus.BAD_REQUEST, "Error trying to get github user info");
      }

      const gitUserInfo = await this.userService?.getGithubUserInfo(token);

      if (gitUserInfo) {
        const userExist = await this.userService?.findByEmail(gitUserInfo.email);

        if (userExist) {

          const tokenData = this.userUtils?.createToken(userExist);
          res.status(200).json({ userData: userExist, tokenData });
          return;
        }

        const temp = this.userUtils?.fillUser(gitUserInfo);
        if (!temp) throw new HttpException(HttpStatus.BAD_REQUEST, 'Error trying map github user')

        const newUser = await this.userService?.add(temp);
        if (newUser) {

          const tokenData = this.userUtils?.createToken(newUser);
          res.status(200).json({ userData: newUser, tokenData });
          return;
        }
      }
    } catch (error) {
      res.status(error.status).json(error);
    }
  }

  async addTags(req: Request, res: Response) {
    try {
      const { email, tags } = req.body;
      await this.userService.updateTags(email, tags);
      res.status(HttpStatus.NO_CONTENT).end();
    } catch (error) {
      res.status(error.status).json(error);
    }
  }

}
