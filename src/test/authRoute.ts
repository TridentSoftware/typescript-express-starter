import {suite, test} from "mocha-typescript";
import {User} from "../models/user";
import {dbconfig} from "../config/database";
import mongoose = require("mongoose");
import {IUser} from "../interfaces/user";
import {AuthRoute} from "../routes/auth";
import httpMocks = require("node-mocks-http");
import {Credentials} from "../util/auth";

@suite("Auth route tests")
class AuthRouteTest {
  private to: number = 200;
  private registerData: IUser;
  private existingUser: IUser;
  private route: AuthRoute;
  private res: any;
  private next: any = () => {
  };

  public static before(done: Function) {
    //require chai and use should() assertions
    let chai = require("chai");
    chai.should();

    //use q promises
    global.Promise = require("q").Promise;
    //use q library for mongoose promise
    mongoose.Promise = global.Promise;

    //connect to mongoose and create model
    mongoose.connect(dbconfig.connection + "_test").then(done());
  }

  public static after(done: Function) {
    User.remove({}).then(() => {
      mongoose.disconnect().then(done());
    });
  }

  public before(done: Function) {
    this.route = new AuthRoute();
    //noinspection TypeScriptUnresolvedFunction
    this.res = httpMocks.createResponse({
      eventEmitter: require("events").EventEmitter
    });

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
    const req = httpMocks.createRequest({
      method: "POST",
      url: "/auth/register",
      body: this.registerData
    });
    this.route.register(req, this.res, this.next);
    setTimeout(() => {
      //noinspection TypeScriptUnresolvedFunction
      const data = JSON.parse(this.res._getData());
      data.success.should.equal(true);
      this.res.statusCode.should.equal(200);
      done();
    }, this.to);
  }

  @test("Should fail registration validation")
  public registerFailValid(done: Function) {
    this.registerData.firstName = null;
    this.registerData.lastName = null;
    //noinspection TypeScriptUnresolvedFunction
    const req = httpMocks.createRequest({
      method: "POST",
      url: "/auth/register",
      body: this.registerData
    });
    this.route.register(req, this.res, this.next);
    setTimeout(() => {
      //noinspection TypeScriptUnresolvedFunction
      const data = JSON.parse(this.res._getData());
      data.error.should.equal("ValidationError");
      data.errors.should.be.lengthOf(2);
      data.errors.should.have.deep.property("[0].field", "lastName");
      data.errors.should.have.deep.property("[1].field", "firstName");
      this.res.statusCode.should.equal(400);
      done();
    }, this.to);
  }

  @test("Should fail registration duplicate")
  public registerFailDuplicate(done: Function) {
    const eu = new User(this.existingUser);
    eu.save().then(() => {
      this.registerData.username = this.existingUser.username;
      //noinspection TypeScriptUnresolvedFunction
      const req = httpMocks.createRequest({
        method: "POST",
        url: "/auth/register",
        body: this.registerData
      });
      this.route.register(req, this.res, this.next);
      setTimeout(() => {
        //noinspection TypeScriptUnresolvedFunction
        const data = JSON.parse(this.res._getData());
        data.error.should.equal("Conflict");
        this.res.statusCode.should.equal(409);
        done();
      }, this.to);
    });
  }

  @test("Should login successfully")
  public login(done: Function) {
    const eu = new User(this.existingUser);
    eu.save().then(() => {
      const creds = {username: this.existingUser.username, password: this.existingUser.password} as Credentials;
      //noinspection TypeScriptUnresolvedFunction
      const req = httpMocks.createRequest({
        method: "POST",
        url: "/auth",
        body: creds
      });
      this.route.auth(req, this.res, this.next);
      setTimeout(() => {
        //noinspection TypeScriptUnresolvedFunction
        const data = JSON.parse(this.res._getData());
        data.token.should.exist;
        data.success.should.equal(true);
        this.res.statusCode.should.equal(200);
        done();
      }, this.to);
    });
  }

  @test("Should fail login validation")
  public loginValidation(done: Function) {
    const creds = {username: "", password: this.existingUser.password} as Credentials;
    //noinspection TypeScriptUnresolvedFunction
    const req = httpMocks.createRequest({
      method: "POST",
      url: "/auth",
      body: creds
    });
    this.route.auth(req, this.res, this.next);
    setTimeout(() => {
      //noinspection TypeScriptUnresolvedFunction
      const data = JSON.parse(this.res._getData());
      data.error.should.equal("ValidationError");
      data.message.should.equal("Username is required.");
      this.res.statusCode.should.equal(400);
      done();
    }, this.to);
  }

  @test("Should fail login authorization (password)")
  public loginAuthorizationPassword(done: Function) {
    const eu = new User(this.existingUser);
    eu.save().then(() => {
      const creds = {username: this.existingUser.username, password: "wrong"} as Credentials;
      //noinspection TypeScriptUnresolvedFunction
      const req = httpMocks.createRequest({
        method: "POST",
        url: "/auth",
        body: creds
      });
      this.route.auth(req, this.res, this.next);
      setTimeout(() => {
        //noinspection TypeScriptUnresolvedFunction
        const data = JSON.parse(this.res._getData());
        data.error.should.equal("Unauthorized");
        this.res.statusCode.should.equal(401);
        done();
      }, this.to);
    });
  }

  @test("Should fail login authorization (username)")
  public loginAuthorizationUsername(done: Function) {
    const eu = new User(this.existingUser);
    eu.save().then(() => {
      const creds = {username: "wrong", password: this.existingUser.password} as Credentials;
      //noinspection TypeScriptUnresolvedFunction
      const req = httpMocks.createRequest({
        method: "POST",
        url: "/auth",
        body: creds
      });
      this.route.auth(req, this.res, this.next);
      setTimeout(() => {
        //noinspection TypeScriptUnresolvedFunction
        const data = JSON.parse(this.res._getData());
        data.error.should.equal("Unauthorized");
        this.res.statusCode.should.equal(401);
        done();
      }, this.to);
    });
  }

  @test("Should fail login authorization (disabled)")
  public loginAuthorizationDisabled(done: Function) {
    this.existingUser.disabled = true;
    const eu = new User(this.existingUser);
    eu.save().then(() => {
      const creds = {username: this.existingUser.username, password: this.existingUser.password} as Credentials;
      //noinspection TypeScriptUnresolvedFunction
      const req = httpMocks.createRequest({
        method: "POST",
        url: "/auth",
        body: creds
      });
      this.route.auth(req, this.res, this.next);
      setTimeout(() => {
        //noinspection TypeScriptUnresolvedFunction
        const data = JSON.parse(this.res._getData());
        data.error.should.equal("Unauthorized");
        this.res.statusCode.should.equal(401);
        done();
      }, this.to);
    });
  }

  @test("Should get profile when logged in.")
  public getProfile(done: Function) {
    const eu = new User(this.existingUser);
    eu.save().then(user => {
      const creds = {username: this.existingUser.username, password: this.existingUser.password} as Credentials;
      //noinspection TypeScriptUnresolvedFunction
      const req = httpMocks.createRequest({
        method: "GET",
        url: "/auth/profile",
        user: user
      });
      this.route.profile(req, this.res, this.next);
      setTimeout(() => {
        //noinspection TypeScriptUnresolvedFunction
        const data = JSON.parse(this.res._getData());
        data.user.should.exist;
        data.user.username.should.equal(this.existingUser.username);
        data.user.should.have.property("password").equal(null);
        this.res.statusCode.should.equal(200);
        done();
      }, this.to);
    });
  }
}
