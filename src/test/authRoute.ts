import {suite, test} from "mocha-typescript";
import {User} from "../models/user";
import {dbconfig} from "../config/database";
import mongoose = require("mongoose");
import {IUser} from "../interfaces/user";
import {AuthRoute} from "../routes/auth";
import * as httpMocks from "node-mocks-http";

@suite("Auth route tests")
class AuthRouteTest {
  private to: number = 200;
  private registerData: IUser;
  private existingUser: IUser;
  private route: AuthRoute;

  public static before(done: Function) {
    //require chai and use should() assertions
    let chai = require("chai");
    chai.should();

    //use q promises
    global.Promise = require("q").Promise;
    //use q library for mongoose promise
    mongoose.Promise = global.Promise;

    //connect to mongoose and create model
    mongoose.connect(dbconfig.connection + "_test").then(() => done());
  }

  public static after(done: Function) {
    User.remove({}).then(() => {
      mongoose.disconnect().then(done());
    });
  }

  public before(done: Function) {
    this.route = new AuthRoute();

    //new user data
    this.registerData = {
      firstName: "Bruce",
      lastName: "Wayne",
      username: "batman",
      email: "bruce@wayneenterprises.com",
      password: "password1"
    } as IUser;

    //new user data
    this.existingUser = {
      firstName: "Bruce",
      lastName: "Wayne",
      username: "batman1",
      email: "bruce1@wayneenterprises.com",
      password: "password1"
    } as IUser;

    User.remove({}).then(done());
  }

  constructor() {

  }

  @test("Should register successfully")
  public register(done: Function) {
    //noinspection TypeScriptUnresolvedFunction
    let req = httpMocks.createRequest({
      method: "POST",
      url: "/auth/register",
      body: this.registerData
    });
    //noinspection TypeScriptUnresolvedFunction
    let res = httpMocks.createResponse();
    let next = () => {
    };
    this.route.register(req, res, next);
    setTimeout(() => {
      const data = JSON.parse(res._getData());
      data.success.should.equal(true);
      res.statusCode.should.equal(200);
      done();
    }, this.to);
  }

  @test("Should fail registration validation")
  public registerFailValid(done: Function) {
    this.registerData.firstName = null;
    //noinspection TypeScriptUnresolvedFunction
    let req = httpMocks.createRequest({
      method: "POST",
      url: "/auth/register",
      body: this.registerData
    });
    //noinspection TypeScriptUnresolvedFunction
    let res = httpMocks.createResponse();
    let next = () => {
    };
    this.route.register(req, res, next);
    setTimeout(() => {
      res.statusCode.should.equal(400);
      done();
    }, this.to);
  }

  @test("Should fail registration duplicate")
  public registerFailDuplicate(done: Function) {
    const eu = new User(this.existingUser);
    eu.save().then(() => {
      this.registerData.username = "batman1";
      //noinspection TypeScriptUnresolvedFunction
      let req = httpMocks.createRequest({
        method: "POST",
        url: "/auth/register",
        body: this.registerData
      });
      //noinspection TypeScriptUnresolvedFunction
      let res = httpMocks.createResponse();
      let next = () => {
      };
      this.route.register(req, res, next);
      setTimeout(() => {
        res.statusCode.should.equal(409);
        done();
      }, this.to);
    });
  }

  @test("Should login successfully")
  public login(done: Function) {
    const credentials = {username: this.existingUser.username, password: this.existingUser.password};
    const eu = new User(this.existingUser);
    eu.save().then(() => {
      //noinspection TypeScriptUnresolvedFunction
      let req = httpMocks.createRequest({
        method: "POST",
        url: "/auth/register",
        body: credentials
      });
      //noinspection TypeScriptUnresolvedFunction
      let res = httpMocks.createResponse();
      let next = () => {
      };
      this.route.auth(req, res, next);
      setTimeout(() => {
        //noinspection TypeScriptUnresolvedFunction
        const data = JSON.parse(res._getData());
        data.success.should.equal(true);
        res.statusCode.should.equal(200);
        done();
      }, this.to);
    });
  }

  @test("Should fail login validation")
  public loginValidation(done: Function) {
    const credentials = {username: "", password: this.existingUser.password};
    const eu = new User(this.existingUser);
    eu.save().then(() => {
      //noinspection TypeScriptUnresolvedFunction
      let req = httpMocks.createRequest({
        method: "POST",
        url: "/auth/register",
        body: credentials
      });
      //noinspection TypeScriptUnresolvedFunction
      let res = httpMocks.createResponse();
      let next = () => {
      };
      this.route.auth(req, res, next);
      setTimeout(() => {
        res.statusCode.should.equal(400);
        done();
      }, this.to);
    });
  }

  @test("Should fail login authorization (password)")
  public loginAuthorizationPassword(done: Function) {
    const credentials = {username: this.existingUser.username, password: "wrong"};
    const eu = new User(this.existingUser);
    eu.save().then(() => {
      //noinspection TypeScriptUnresolvedFunction
      let req = httpMocks.createRequest({
        method: "POST",
        url: "/auth/register",
        body: credentials
      });
      //noinspection TypeScriptUnresolvedFunction
      let res = httpMocks.createResponse();
      let next = () => {
      };
      this.route.auth(req, res, next);
      setTimeout(() => {
        res.statusCode.should.equal(401);
        done();
      }, this.to);
    });
  }

  @test("Should fail login authorization (username)")
  public loginAuthorizationUsername(done: Function) {
    const credentials = {username: "wrong", password: this.existingUser.password};
    const eu = new User(this.existingUser);
    eu.save().then(() => {
      //noinspection TypeScriptUnresolvedFunction
      let req = httpMocks.createRequest({
        method: "POST",
        url: "/auth/register",
        body: credentials
      });
      //noinspection TypeScriptUnresolvedFunction
      let res = httpMocks.createResponse();
      let next = () => {
      };
      this.route.auth(req, res, next);
      setTimeout(() => {
        res.statusCode.should.equal(401);
        done();
      }, this.to);
    });
  }

  @test("Should fail login authorization (disabled)")
  public loginAuthorizationDisabled(done: Function) {
    const credentials = {username: this.existingUser.username, password: this.existingUser.password};
    this.existingUser.disabled = true;
    const eu = new User(this.existingUser);
    eu.save().then(() => {
      //noinspection TypeScriptUnresolvedFunction
      let req = httpMocks.createRequest({
        method: "POST",
        url: "/auth/register",
        body: credentials
      });
      //noinspection TypeScriptUnresolvedFunction
      let res = httpMocks.createResponse();
      let next = () => {
      };
      this.route.auth(req, res, next);
      setTimeout(() => {
        res.statusCode.should.equal(401);
        done();
      }, this.to);
    });
  }
}
