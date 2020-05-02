/* eslint-disable @typescript-eslint/camelcase */
import IGithubUser from "./base/IGithubUser";
import { IUser } from "./base/IUser";
import TokenData from "types/tokenData.interface";
import DataStoredInToken from "types/dataStoredInToken";
import Environment from "../../Environment";
import * as jwt from "jsonwebtoken";

export default class UserUtil {

  private ENV = new Environment();

  fillUser(gitInfo: IGithubUser): IUser {
    return {
      email: gitInfo.email,
      firstName: gitInfo.name?.split(" ")[0],
      lastName: gitInfo.name?.split(" ").pop(),
      avatar_url: gitInfo.avatar_url,
      bio: gitInfo.name,
      blog: gitInfo.name,
      gitId: gitInfo.id,
      public_repos: gitInfo.public_repos,
      repos_url: gitInfo.name
    };
  }

  createToken(user: IUser): TokenData {
    const expiresToken = 60;
    const expiresRefresh = 60 * 60;
    const secret = this.ENV.getSecret();
    const dataStoredInToken: DataStoredInToken = {
      _id: user._id || "",
    };
    return {
      refreshToken: jwt.sign(dataStoredInToken, secret, { expiresIn: expiresRefresh }),
      token: jwt.sign(dataStoredInToken, secret, { expiresIn: expiresToken }),
    };
  }

  verifyToken(token: string): DataStoredInToken {
    const secret = this.ENV.getSecret();
    return jwt.verify(token, secret) as DataStoredInToken;
  }

  formatTokenUserData(user: IUser): TokenData | undefined {
    if (user.loc && user.loc.coordinates) {
      user.loc.coordinates.reverse();
    }
    return this.createToken(user);
  }
}