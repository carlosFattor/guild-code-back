import { validate, validateOrReject, Contains, IsInt, Length, IsEmail, IsFQDN, IsDate, Min, Max, IsString } from "class-validator";

import { IUser } from "./IUser";


export class UserDto implements IUser {

  @IsEmail()
  email = "";

  @IsString()
  firstName = "";

  @IsString()
  lastName?: string;

  gender?: number;

} 