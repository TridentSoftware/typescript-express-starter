import {IUser} from "../interfaces/user";
import {ICredentials} from "../interfaces/auth";
import * as config from "config";
const moment = require("moment");
const attemptsBeforeLockout = 5;
const loginSpanInMinutes = 15;
const lockoutInMinutes = 5;

export const authUtil = {
  realmIsValid: (realm: string): boolean => {
    if (!realm || !(realm.length > 0)) return true; //no realm is valid
    const validRealms: string[] = config.get("app.realms");
    console.log(validRealms);
    return !(validRealms.indexOf(realm) == -1)
  },
  setCredentialRealm: (creds: ICredentials) => {
    if (creds.realm && creds.realm.length > 0)
      creds.username = [creds.realm, creds.username].join(":");
    return creds;
  },
  setUserRealm: (user: IUser) => {
    if (user.realm && user.realm.length > 0)
      user.username = [user.realm, user.username].join(":");
    return user;
  },
  scrubUserRealm: (user: IUser) => {
    if (user.realm && user.realm.length > 0)
      user.username = user.username.replace(user.realm + ":", "");
    return user;
  },
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
