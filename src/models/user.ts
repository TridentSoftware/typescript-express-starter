import mongoose = require("mongoose"); //import mongoose
const Schema = mongoose.Schema;
import bcrypt = require("bcryptjs");
import {dbUtil} from "../util/database";
import {IUser} from "../interfaces/user";

const UserSchema = new Schema({
  //realm: {type: String},
  firstName: {type: String, required: [true, "First name is required."]},
  lastName: {type: String, required: [true, "Last name is required."]},
  displayName: {type: String, required: false},
  username: {type: String, unique: true, required: [true, "Username is required."]},
  email: {type: String, unique: true, required: [true, "Email is required."]},
  emailValidated: {type: Boolean, default: false},
  password: {type: String, required: [true, "Password is required."]},
  passwordQuestion: {type: String},
  passwordQuestionAnswer: {type: String},
  lastPasswordChange: {type: Date, default: Date.now},
  passwordExpires: {type: Date},
  lastLoginAttempt: {type: Date},
  loginAttempts: {type: Number, default: 0},
  lastLogin: {type: Date},
  lastLockout: {type: Date},
  lockedOut: {type: Boolean, default: false},
  disabled: {type: Boolean, default: false},
  deleted: {type: Boolean, default: false}
});

//if you want audit fields
dbUtil.addAuditFields(UserSchema);

UserSchema.methods.comparePassword = function(clearPassword: string, callback: Function) {
  bcrypt.compare(clearPassword, this.password, (err, isMatch) => {
    if (err) return callback(err);
    return callback(null, isMatch);
  });
};

//encrypt passwords
UserSchema.pre("save", function (next: Function) {
  const user = this;
  if (!user.isModified("password")) return next();

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      return next();
    });
  });
});

export const User = mongoose.model<IUser>("User", UserSchema);
