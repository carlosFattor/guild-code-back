/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable no-underscore-dangle */
import * as HttpStatus from "http-status-codes";
import { Request, Response, NextFunction } from "express";
import UserService from "./UserService";
import HttpException from "../exceptions/HttpException";
import UserUtil from "./UserUtils";
import RequestWithUser from "types/requestWithUser.interface";

export default class UserController {

  private userService: UserService | null = null;
  private userUtils: UserUtil | null = null;

  constructor() {
    this.userService = new UserService();
    this.userUtils = new UserUtil();
  }

  async updateLocation(req: RequestWithUser, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const latLng = req.body;
      const user = req.user;
      if (user) {
        const userUpdated = await this.userService?.updateLocation(user, latLng);
        return res.status(200).json({ userUpdated });
      }
      throw new HttpException(HttpStatus.NOT_FOUND, "User not found", null);
    } catch (error) {
      next(new HttpException(404, "It was impossible update the user", error));
    }
  }

  async fetchUsersByLatLng(req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const lat = req.params.lat;
      const lng = req.params.lng;
      const zoom = req.params.zoom;
      const data = await this.userService?.fetchUserByLatLng(parseFloat(lat), parseFloat(lng), parseInt(zoom));
      data?.forEach(user => {
        user.loc?.coordinates.reverse();
      });
      return res.json(data);
    } catch (error) {
      next(new HttpException(404, error.message, error));
    }
  }

  async fetchUsers(req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const data = await this.userService?.getAll();
      return res.json(data);
    } catch (error) {
      next(new HttpException(404, "It was impossible create a new user", error));
    }
  }

  async addUser(req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const { body } = req;
      const user = await this.userService?.add(body);
      return res.status(HttpStatus.CREATED).json(user);
    } catch (error) {
      next(new HttpException(404, "It was impossible create a new user", error));
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.params;
      const status = await this.userService?.deleteUser(email);
      if (status && status > 0) {
        return res.status(HttpStatus.NO_CONTENT).end();
      } else {
        throw new HttpException(HttpStatus.NOT_FOUND, "User not found", null);
      }
    } catch (error) {
      next(error);
    }
  }

  async saveGithubUser(req: Request, res: Response, next: NextFunction) {
    try {
      const githubToken = req.params.access_token;

      const token = await this.userService?.getGithubToken(githubToken);

      if (!token) {
        throw new HttpException(HttpStatus.BAD_REQUEST, "Error trying to get github user info", null);
      }

      const gitUserInfo = await this.userService?.getGithubUserInfo(token);

      if (gitUserInfo) {
        const userExist = await this.userService?.findByEmail(gitUserInfo.email);

        if (userExist) {
          if (userExist.loc) {
            userExist.loc.coordinates.reverse();
          }
          const tokenData = this.userUtils?.createToken(userExist);
          return res.status(200).json({ userData: userExist, tokenData });
        }

        const temp = this.userUtils?.fillUser(gitUserInfo);
        if (!temp) throw new HttpException(HttpStatus.BAD_REQUEST, "Error trying map github user", null);

        const newUser = await this.userService?.add(temp);
        if (newUser) {
          if (newUser.loc) {
            newUser.loc.coordinates.reverse();
          }
          const tokenData = this.userUtils?.createToken(newUser);
          return res.status(200).json({ userData: newUser, tokenData });
        }
        throw new HttpException(HttpStatus.BAD_REQUEST, "Error trying map github user", null);
      }
    } catch (error) {
      next(error);
    }
  }

  async addTags(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, tags } = req.body;
      await this.userService?.updateTags(email, tags);
      return res.status(HttpStatus.NO_CONTENT).end();
    } catch (error) {
      next(new HttpException(HttpStatus.BAD_REQUEST, "Error trying to update user tags", error));
    }
  }

  async refreshToken(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const headers = req.headers;
      if (headers && headers.authorization) {
        const token = req.body.refreshToken;
        const verificationResponse = this.userUtils?.verifyToken(token);
        const id = verificationResponse?._id;
        if (id) {
          const user = await this.userService?.findUserById(id);
          if (user) {
            const tokens = this.userUtils?.createToken(user);
            return res.status(200).json({ tokens });
          }
          throw new HttpException(HttpStatus.NOT_FOUND, "User not found", null);
        }
        throw new HttpException(HttpStatus.NOT_FOUND, "User not found", null);
      }
    } catch (error) {
      next(error);
    }
  }
}
