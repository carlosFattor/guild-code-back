/* eslint-disable @typescript-eslint/camelcase */
import { IsEmail, IsString, IsNumber } from "class-validator";
import { Location } from "./ILocation.interface";
import { IUser } from "./IUser";


export default class UserDto implements IUser {
  _id = "";

  @IsEmail()
  email = "";

  @IsString()
  firstName = "";

  @IsString()
  lastName?: string;

  @IsString()
  avatar_url?: string;

  @IsString()
  bio?: string;

  @IsString()
  blog?: string;

  @IsNumber()
  gitId?: number;

  @IsNumber()
  public_repos?: number;

  @IsString()
  repos_url?: string;

  tags?: string[];

  loc?: Location;

  roles?: string[] | undefined;

} 