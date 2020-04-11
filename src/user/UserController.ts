/* eslint-disable no-underscore-dangle */
import * as HttpStatus from "http-status-codes";
import * as jwt from "jsonwebtoken";
import { Request, Response } from "express";
import UserService from "./UserService";
import { IUser } from "./base/IUser";
import HttpException from "../exceptions/HttpException";
import IGithubUser from "./base/IGithubUser";
import TokenData from "../types/tokenData.interface";
import DataStoredInToken from "../types/dataStoredInToken";
import { Environment } from "../Environment";

export default class UserController {
  private userService: UserService | null = null;

  private ENV = new Environment();

  constructor() {
    this.userService = new UserService();
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
      throw new Error("It was impossible create a new user");
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
          const tokenData = this.createToken(userExist);
          res.send({ user: userExist, tokenData });
          return;
        }

        const temp = this.fillUser(gitUserInfo);
        const newUser = await this.userService?.add(temp);
        if (newUser) {
          const tokenData = this.createToken(newUser);
          res.send({ user: newUser, tokenData });
          return;
        }
      }
    } catch (error) {
      res.status(error.status).json(error);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private fillUser(gitInfo: IGithubUser): IUser {
    return {
      email: gitInfo.email,
      firstName: gitInfo.name?.split(" ")[0],
      lastName: gitInfo.name?.split(" ").pop(),
      avatar_url: gitInfo.name,
      bio: gitInfo.name,
      blog: gitInfo.name,
      gitId: gitInfo.id,
      public_repos: gitInfo.public_repos,
      repos_url: gitInfo.name,
    } as IUser;
  }

  public createToken(user: IUser): TokenData {
    const expiresIn = 60 * 60; // an hour
    const expiresAfter = 2 * 60 * 60;
    const secret = this.ENV.getSecret();
    const dataStoredInToken: DataStoredInToken = {
      _id: user._id,
    };
    return {
      token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
      refreshToke: jwt.sign(dataStoredInToken, secret, { expiresIn: expiresAfter }),
    };
  }
}
