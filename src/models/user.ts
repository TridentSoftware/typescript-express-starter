import mongoose = require("mongoose"); //import mongoose
const Schema = mongoose.Schema;
import * as bcrypt from "bcryptjs";
import {dbconfig} from "../config/database";

const UserSchema = new Schema({
    realm: {type: String},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    displayName: {type: String, required: false},
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    emailValidated: { type: Boolean, default: false },
    password: {type: String, required: true},
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
dbconfig.addAuditFields(UserSchema);

UserSchema.pre('save', function(next: Function){
    var user = this;
    if (!user.isModified('password')) return next();

    bcrypt.genSalt(10, (err, salt) =>{
        if (err) return next(err);
        bcrypt.hash(user.password, salt, (err, hash)=>{
            if (err) return next(err);
            user.password = hash;
            return next();
        });
    });
});

UserSchema.methods.comparePassword = (clearPassword: string, callback: Function) => {
    bcrypt.compare(clearPassword, this.password, (err, isMatch) =>{
        if (err) return callback(err);
        return callback(null, isMatch);
    });
};

export const User = mongoose.model("User", UserSchema);
