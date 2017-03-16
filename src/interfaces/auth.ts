import {Request} from "express";
import {IUser} from "./user";

export interface AuthenticatedRequest extends Request {
  user: IUser;
}

export interface Credentials {
  //realm?: string;
  username?: string;
  password?: string;
}
