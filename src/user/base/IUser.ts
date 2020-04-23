import { Document } from "mongoose";

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
  loc?: string[];
}

export type IUserDocument = IUser & Document;
