import * as config from "config";
import mongoose = require("mongoose");
import * as http from "http";
import {IUser} from "../interfaces/user";
import {User} from "../models/user";

export class AuthTestBase {
  protected registerData: IUser;
  protected existingUser: IUser;
  protected existingUserInDb: IUser;
  protected static realm: string = "testing";
  protected static testusers: string[] = ["batman", "batman1"];

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
  }

  public static after(done: Function) {
    User.remove({
      //username: {$in: AuthTestBase.testusersWithRealms}
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

    //a little realm work
    const existingUsernameForDb = (AuthTestBase.realm && AuthTestBase.realm.length > 0) ?
      [AuthTestBase.realm, AuthTestBase.testusers[1]].join(":") :
      AuthTestBase.testusers[1];
    this.existingUserInDb = {
      realm: AuthTestBase.realm,
      firstName: "Bruce",
      lastName: "Wayne",
      username: existingUsernameForDb,
      email: "bruce1@wayneenterprises.com",
      password: "password1"
    } as IUser;

    User.remove({
      //username: {$in: AuthTestBase.testusersWithRealms}
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

  protected buildRequestOptions(postData: string, authToken: string = ""): http.RequestOptions {
    const result: http.RequestOptions = {
      headers: {
        "Content-Type": "application/json",
        "Accept": "applicaiton/json",
        "Content-Length": Buffer.byteLength(postData)
      },
      host: "localhost",
      port: 3000
    };

    if (authToken && authToken.length > 0)
      result.headers["Authorization"] = authToken;

    return result;
  }
}
