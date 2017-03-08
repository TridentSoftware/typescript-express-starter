import {Request} from "express";
import {IUser} from "../interfaces/user";
const moment = require("moment");
const attemptsBeforeLockout = 5;
const loginSpanInMinutes = 15;
const lockoutInMinutes = 5;

export const authUtil = {
  loginAttempt: (user: IUser) => {
    user.lastLoginAttempt = new Date();
    user.loginAttempts++;

    //see if this is out of span of counting, if so re-set count
    const mattempt = moment(user.lastLoginAttempt);
    if (mattempt.add(loginSpanInMinutes, "minutes") <= moment) {
      user.loginAttempts = 1;
    }

    user.save();
  },
  loginSuccess: (user: IUser) => {
    user.lockedOut = false;
    user.loginAttempts = 0;
    user.lastLogin = new Date();
    user.save();
  },
  calculateLockout: (user: IUser) => {
    if (user.lockedOut && user.lastLockout) {
      const mlockout = moment(user.lastLockout);
      //see if they've served their time
      if (mlockout.add(lockoutInMinutes, "minutes") <= moment()) {
        user.lockedOut = false;
        user.loginAttempts = 0;
        user.save();
        return;
      }
    }

    if (attemptsBeforeLockout < user.loginAttempts) {
      user.lastLockout = new Date();
      user.lockedOut = true;
      user.save();
    }
  }
};

export interface AuthenticatedRequest extends Request {
  user: IUser;
}

export interface Credentials {
  username?: string;
  password?: string;
}
