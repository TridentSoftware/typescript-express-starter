import { suite, test } from "mocha-typescript";
import {User} from "../models/user";
import {dbconfig} from "../config/database";
import mongoose = require("mongoose");
import {IUser} from "../interfaces/user";

@suite("User object")
class UserTest {
  private data: IUser;

  public static before() {
    //use q promises
    global.Promise = require("q").Promise;
    //use q library for mongoose promise
    mongoose.Promise = global.Promise;

    //connect to mongoose and create model
    mongoose.connect(dbconfig.connection + "_test");

    //require chai and use should() assertions
    let chai = require("chai");
    chai.should();
  }

  public before() {
    //new user data
    this.data = {
      firstName: "Bruce",
      lastName: "Wayne",
      username: "batman",
      email: "bruce@wayneenterprises.com",
      password: "password1"
    } as IUser;

    //clean collection
    User.remove({});
  }

  constructor() {

  }

  @test("should create a new User")
  public create() {
    const newUser = new User(this.data);

    newUser.save((err: any, user: IUser) =>{
      user._id.should.exist;
      user.firstName.should.equal(this.data.firstName);
      user.lastName.should.equal(this.data.lastName);
      user.username.should.equal(this.data.username);
      user.email.should.equal(this.data.email);
      user.password.should.not.equal(this.data.password);
    });
  }

  @test("should validate a new User")
  public validation() {
    this.data.firstName = null;

    const newUser = new User(this.data);

    newUser.save((err: any) =>{
      err.should.exist;
      err.name.should.equal("ValidationError");
    });
  }

  @test("should find a new User")
  public find() {
    const newUser = new User(this.data);

    newUser.save((err: any, user: IUser) =>{
      user._id.should.exist;
      user.firstName.should.equal(this.data.firstName);
      user.lastName.should.equal(this.data.lastName);
      user.username.should.equal(this.data.username);
      user.email.should.equal(this.data.email);
      user.password.should.not.equal(this.data.password);
    });

    const query = {username: this.data.username};
    User.findOne(query, (err: any, user: IUser) =>{
      user._id.should.exist;
      user.firstName.should.equal(this.data.firstName);
      user.lastName.should.equal(this.data.lastName);
      user.username.should.equal(this.data.username);
      user.email.should.equal(this.data.email);
      user.password.should.not.equal(this.data.password);
    });
  }
}
