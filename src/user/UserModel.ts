/* eslint-disable @typescript-eslint/camelcase */
import { Schema, model } from "mongoose";
import { IUserDocument } from "./base/IUser";
import { UserRoles } from "../domains/UserRoles";

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
  },
  tags: {
    type: [String]
  },
  loc: {
    type: {
      type: String,
      enum: ["Point"]
    },
    coordinates: []
  },
  roles: {
    type: [String],
    default: [UserRoles.USER]
  }
}, {
  timestamps: true,
});

UserSchema.methods.getSimpleUSer = function () {
  return {
    _id: this._id,
    email: this.email,
    firstName: this.firstName,
    avatar_url: this.avatar_url,
    bio: this.bio,
    blog: this.blog,
    tags: this.tags,
    loc: this.loc
  };
};

UserSchema.index({ "loc": "2dsphere" });

const User = model<IUserDocument>("User", UserSchema);
export default User;