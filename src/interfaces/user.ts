import {IPersistedModel} from "./persisted-model";
export interface IUser extends IPersistedModel{
  realm?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  username?: string;
  email?: string;
  emailValidated?: boolean;
  password?: string;
  passwordQuestion?: string;
  passwordQuestionAnswer?: string;
  lastPasswordChange?: Date;
  passwordExpires?: Date;
  lastLoginAttempt?: Date;
  loginAttempts?: number;
  lastLogin?: Date;
  lastLockout?: Date;
  lockedOut?: boolean;
  disabled?: boolean;
  deleted?: boolean;
  createdOn?: Date;
  updatedOn?: Date;
  createdBy?: string;
  updatedBy?: string;
  roles?: string[]

  comparePassword(clearPassword: string, callback: Function);
}
