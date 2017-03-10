import {suite, test} from "mocha-typescript";
import {User} from "../models/user";
import * as config from "config";
import mongoose = require("mongoose");
import {IUser} from "../interfaces/user";

@suite("User model tests")
class UserTest {
  private data: IUser;
  private static testusers: string[] = ["testuser:batman"];

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
      username: {$in: this.testusers }
    }).then(() => {
      mongoose.disconnect().then(done());
    });
  }

  public before(done: Function) {
    //new user data
    this.data = {
      firstName: "Bruce",
      lastName: "Wayne",
      username: UserTest.testusers[0],
      email: "bruce@wayneenterprises.com",
      password: "password1"
    } as IUser;

    User.remove({
      username: {$in: UserTest.testusers}
    }).then(done());
  }

  constructor() {

  }

  @test("Should create a new User")
  public create(done: Function) {
    const newUser = new User(this.data);

    newUser.save().then(user => {
      user._id.should.exist;
      user.firstName.should.equal(this.data.firstName);
      user.lastName.should.equal(this.data.lastName);
      user.username.should.equal(this.data.username);
      user.email.should.equal(this.data.email);
      user.password.should.not.equal(this.data.password);
      done();
    });
  }

  @test("Should validate a new User")
  public validation(done: Function) {
    this.data.firstName = null;
    const newUser = new User(this.data);

    newUser.save().catch(err => {
      err.should.exist;
      err.name.should.equal("ValidationError");
      done();
    });
  }

  @test("Should find a new User")
  public find(done: Function) {
    const newUser = new User(this.data);

    newUser.save().then(user => {
      const query = {username: this.data.username};
      User.findOne(query).then(savedUser => {
        savedUser._id.should.exist;
        savedUser.firstName.should.equal(this.data.firstName);
        savedUser.lastName.should.equal(this.data.lastName);
        savedUser.username.should.equal(this.data.username);
        savedUser.email.should.equal(this.data.email);
        savedUser.password.should.not.equal(this.data.password);
        done();
      });
    });
  }
}
