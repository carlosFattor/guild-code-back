import { Schema, model } from "mongoose";
import { IUserDocument } from "./base/IUser";

const UserSchema = new Schema({
  email: {
    required: true,
    type: String,
    unique: true
  },
  firstName: {
    required: true,
    type: String,
  },
  lastName: {
    required: true,
    type: String,
  },
  avatar_url: {
    required: true,
    type: String,
  },
  bio: {
    type: String,
  },
  blog: {
    required: true,
    type: String,
  },
  gitId: {
    required: true,
    type: Number,
  },
  public_repos: {
    required: true,
    type: Number,
  },
  repos_url: {
    required: true,
    type: String,
  }
}, {
  timestamps: true,
});


const User = model<IUserDocument>("User", UserSchema);
export default User;