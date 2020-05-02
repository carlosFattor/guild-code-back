import { Document } from "mongoose";
import { Location } from "./ILocation.interface";

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IUser {
  _id?: string;
  email: string;
  firstName: string;
  lastName?: string;
  avatar_url?: string;
  bio?: string;
  blog?: string;
  gitId?: number;
  public_repos?: number;
  repos_url?: string;
  tags?: string[];
  loc?: Location;
  roles?: string[];
}

export interface UserMethods {
  getSimpleUSer(): IUser;
}

export type IUserDocument = IUser & UserMethods & Document;
