import axios from "axios";
import User from "./UserModel";
import { IUser } from "./base/IUser";
import IGithubUser from "./base/IGithubUser";
import HttpException from "../exceptions/HttpException";
import { Environment } from "../Environment";

export default class UserService {
  private environment: Environment | null = null;

  constructor() {
    this.environment = new Environment();
  }

  async getAll(): Promise<IUser[]> {
    try {
      return await User.find({});
    } catch (error) {
      throw new HttpException(404, error.message);
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      const query = { email };
      const user = await User.findOne(query);
      if (!user) {
        return null;
      }
      return user;
    } catch (error) {
      throw new HttpException(404, error.message);
    }
  }

  async add(user: IUser): Promise<IUser> {
    try {
      const temp = new User(user);
      const data = await temp.save();
      return data;
    } catch (error) {
      throw new HttpException(404, error.message);
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
      throw new HttpException(403, "Token invalid");
    }
  }

  async getGithubUserInfo(githubToken: string): Promise<IGithubUser> {
    try {
      const token = this.sanitizeToken(githubToken);
      console.log({ token });
      return await (
        await axios.get("https://api.github.com/user", {
          headers: {
            Authorization: `token ${token}`,
          },
        })
      ).data;
    } catch (error) {
      throw new HttpException(403, "Token invalid");
    }
  }

  private sanitizeToken(githubToken: string): string {
    const token = githubToken.split("=")[1];
    return token.split("&")[0];
  }
}
