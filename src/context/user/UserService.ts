import axios from "axios";
import User from "./UserModel";
import { IUser } from "./base/IUser";
import IGithubUser from "./base/IGithubUser";
import HttpException from "../../exceptions/HttpException";
import Environment from "../../Environment";
import * as HttpStatus from "http-status-codes";

export default class UserService {

  private environment: Environment | null = null;

  constructor() {
    this.environment = new Environment();
  }

  async fetchUserByLatLng(lat: number, lng: number, zoom: number): Promise<IUser[]> {
    try {
      const positions = [0.5, 0.5, 1, 3, 5, 10, 20, 40, 70, 130, 210, 450, 1000, 1500, 2000, 3000, 5000, 7000, 10000].reverse();
      zoom = positions[zoom];
      const radius = zoom / 3963.2;
      const data = await User.find(
        {
          loc: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
        }
      );

      return data;
    } catch (error) {
      throw new HttpException(HttpStatus.NOT_FOUND, error.message, error);
    }
  }

  async getAll(): Promise<IUser[]> {
    try {
      return await User.find({});
    } catch (error) {
      throw new HttpException(HttpStatus.NOT_FOUND, error.message, error);
    }
  }

  async updateLocation(user: IUser, latLng: { [key: string]: string }): Promise<IUser> {
    try {
      const lat = latLng["lat"];
      const lng = latLng["lng"];
      const location = { type: "Point", coordinates: [lng, lat] };
      const query = { email: user.email };
      const update = { loc: location };

      const userUpdated = await User.findOneAndUpdate(query, update, { new: true });

      if (userUpdated) {
        userUpdated.loc?.coordinates.reverse();
        return userUpdated;
      }
      throw new HttpException(HttpStatus.BAD_REQUEST, "It was impossible to update user position", null);
    } catch (error) {
      throw new HttpException(HttpStatus.BAD_REQUEST, error.message, error);
    }
  }

  async findUserById(id: string): Promise<IUser | null> {
    try {
      return await User.findById(id);
    } catch (error) {
      throw new HttpException(HttpStatus.NOT_FOUND, error.message, error);
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      const query = { email };
      const user = await User.findOne(query);
      if (!user) {
        return null;
      }
      return user.getSimpleUSer();
    } catch (error) {
      throw new HttpException(HttpStatus.NOT_FOUND, error.message, error);
    }
  }

  async add(user: IUser): Promise<IUser> {
    try {
      const temp = new User(user);
      const data = await temp.save();
      return data.getSimpleUSer();
    } catch (error) {
      throw new HttpException(HttpStatus.BAD_REQUEST, error.message, error);
    }
  }

  async deleteUser(email: string): Promise<number> {
    const query = { email };
    const status = await User.deleteOne(query);
    return status.deletedCount || 0;
  }

  async getGithubToken(githubToken: string): Promise<string> {
    try {
      const URI = `https://github.com/login/oauth/access_token?client_id=${this.environment?.getClientId()}&client_secret=${this.environment?.getClientSecret()}&code=${githubToken}`;
      return await (
        await axios.post(URI, {
          headers: {
            accept: "application/json",
          },
        })
      ).data;
    } catch (error) {
      throw new HttpException(403, "Token invalid", error);
    }
  }

  async getGithubUserInfo(githubToken: string): Promise<IGithubUser> {
    try {
      const token = this.sanitizeToken(githubToken);

      return await (
        await axios.get("https://api.github.com/user", {
          headers: {
            Authorization: `token ${token}`,
          },
        })
      ).data;
    } catch (error) {
      throw new HttpException(HttpStatus.FORBIDDEN, "Token invalid", error);
    }
  }

  async updateTags(email: string, tags: [string]): Promise<string[] | undefined> {
    try {
      const query = { email };
      const doc = await User.findOneAndUpdate(query, { tags });

      return doc?.tags;

    } catch (error) {
      throw new HttpException(HttpStatus.CONFLICT, "Was not possible to update tag\'s!", error);
    }
  }

  private sanitizeToken(githubToken: string): string {
    const token = githubToken.split("=")[1];
    return token.split("&")[0];
  }
}
