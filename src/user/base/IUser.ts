import { Document } from "mongoose";

export interface IUser {
  _id: string;
  email: string;
  firstName: string;
  lastName?: string;
  avatar_url?: string;
  bio?: string;
  blog?: string;
  gitId?: number;
  public_repos?: number;
  repos_url?: string;
}

export type IUserDocument = IUser & Document;
