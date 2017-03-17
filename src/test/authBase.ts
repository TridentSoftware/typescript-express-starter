import * as config from "config";
import mongoose = require("mongoose");
import axios from "axios";
import {IUser} from "../interfaces/user";
import {User} from "../models/user";
import {ICredentials} from "../interfaces/auth";
import {authUtil} from "../util/auth";

export class AuthTestBase {
  protected registerData: IUser;
  protected existingUser: IUser;
  protected existingUserInDb: IUser;
  protected static realm: string = "testing";
  protected static testusers: string[] = ["batman", "batman1"];
  protected static baseUrl: string = "http://localhost:3000/api";

  constructor() {

  }

  public static before(done: Function) {
    //require chai and use should() assertions
    let chai = require("chai");
    chai.should();

    //use q promises
    global.Promise = require("q").Promise;
    //use q library for mongoose promise
    mongoose.Promise = global.Promise;

    //connect to mongoose and create model
    mongoose.connect(config.get("database.connection")).then(done());

    axios.defaults.baseURL = AuthTestBase.baseUrl;
  }

  public static after(done: Function) {
    User.remove({
      realm: AuthTestBase.realm
    }).then(() => {
      mongoose.disconnect().then(done());
    });
  }

  public before(done: Function) {
    //new user data
    this.registerData = {
      realm: AuthTestBase.realm,
      firstName: "Bruce",
      lastName: "Wayne",
      username: AuthTestBase.testusers[0],
      email: "bruce@wayneenterprises.com",
      password: "password1"
    } as IUser;

    //new user data
    this.existingUser = {
      realm: AuthTestBase.realm,
      firstName: "Bruce",
      lastName: "Wayne",
      username: AuthTestBase.testusers[1],
      email: "bruce1@wayneenterprises.com",
      password: "password1"
    } as IUser;

    //exesting user realm
    let creds: ICredentials = {
      realm: AuthTestBase.realm,
      username: AuthTestBase.testusers[1],
      password: "password1"
    };
    creds = authUtil.setCredentialRealm(creds);
    this.existingUserInDb = {
      realm: creds.realm,
      firstName: "Bruce",
      lastName: "Wayne",
      username: creds.username,
      email: "bruce1@wayneenterprises.com",
      password: creds.password
    } as IUser;

    User.remove({
      realm: AuthTestBase.realm
    }).then(() => {
      //existing user
      const eu = new User(this.existingUserInDb);
      eu.save().then(user => {
        this.existingUserInDb = user;
        done()
      });
    });
  }
}
