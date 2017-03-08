import {Request} from "express";
import {IUser} from "../interfaces/user";
const moment = require("moment");
const attemptsBeforeLockout = 5;
const loginSpanInMinutes = 15;
const lockoutInMinutes = 5;

export const authUtil = {
  loginAttempt: (user: IUser) => {
    user.loginAttempts++;
    //see if this is out of span of counting, if so re-set count
    const attemptTime = moment(user.lastLoginAttempt);
    if (attemptTime.add(loginSpanInMinutes, "minutes") <= moment) {
      user.loginAttempts = 1;
    }
    user.lastLoginAttempt = new Date();
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
      const lockoutTime = moment(user.lastLockout);
      //see if they've served their time
      if (lockoutTime.add(lockoutInMinutes, "minutes") <= moment()) {
        user.lockedOut = false;
        user.loginAttempts = 0;
        user.save();
        return;
      }
    }

    if (user.loginAttempts < attemptsBeforeLockout) {
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
  //realm?: string;
  username?: string;
  password?: string;
}
