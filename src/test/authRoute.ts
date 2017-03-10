import {suite, test} from "mocha-typescript";
import {User} from "../models/user";
import * as config from "config";
import mongoose = require("mongoose");
import {IUser} from "../interfaces/user";
import {Credentials} from "../util/auth";
import * as http from "http";

/**
 * This test suite must have the development server running!
 */
@suite("Auth route tests (over http)")
class AuthRouteTest {
  private registerData: IUser;
  private existingUser: IUser;
  private static testusers: string[] = ["testuser:batman", "testuser:batman1"];

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
    this.registerData = {
      firstName: "Bruce",
      lastName: "Wayne",
      username: AuthRouteTest.testusers[0],
      email: "bruce@wayneenterprises.com",
      password: "password1"
    } as IUser;

    //new user data
    this.existingUser = {
      firstName: "Bruce",
      lastName: "Wayne",
      username: AuthRouteTest.testusers[1],
      email: "bruce1@wayneenterprises.com",
      password: "password1"
    } as IUser;

    User.remove({
      username: {$in: AuthRouteTest.testusers}
    }).then(done());
  }

  constructor() {

  }

  private buildRequestOptions(postData: string, authToken: string = ""): http.RequestOptions {
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

  @test("Should register successfully")
  public register(done: Function) {
    const postData = JSON.stringify(this.registerData);

    const opts = this.buildRequestOptions(postData);
    opts.path = "/api/auth/register";
    opts.method = "POST";

    const post = http.request(opts, (res) => {
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        const data: any = JSON.parse(chunk.toString());
        data.success.should.equal(true);
        res.statusCode.should.equal(200);
        done();
      });
    });

    post.write(postData);
    post.end();
  }

  @test("Should fail registration validation")
  public registerFailValid(done: Function) {
    delete this.registerData.firstName;
    delete this.registerData.lastName;

    const postData = JSON.stringify(this.registerData);

    const opts = this.buildRequestOptions(postData);
    opts.path = "/api/auth/register";
    opts.method = "POST";

    const post = http.request(opts, (res) => {
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        const data: any = JSON.parse(chunk.toString());
        data.error.should.equal("ValidationError");
        data.errors.should.be.lengthOf(2);
        data.errors.should.have.deep.property("[0].field", "lastName");
        data.errors.should.have.deep.property("[1].field", "firstName");
        res.statusCode.should.equal(400);
        done();
      });
    });

    post.write(postData);
    post.end();
  }

  @test("Should fail registration duplicate")
  public registerFailDuplicate(done: Function) {
    const eu = new User(this.existingUser);
    eu.save().then(() => {
      this.registerData.username = this.existingUser.username;
      const postData = JSON.stringify(this.registerData);

      const opts = this.buildRequestOptions(postData);
      opts.path = "/api/auth/register";
      opts.method = "POST";

      const post = http.request(opts, (res) => {
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const data: any = JSON.parse(chunk.toString());
          data.error.should.equal("Conflict");
          res.statusCode.should.equal(409);
          done();
        });
      });

      post.write(postData);
      post.end();
    });
  }

  @test("Should login successfully")
  public login(done: Function) {
    const eu = new User(this.existingUser);
    eu.save().then(() => {
      const creds = {username: this.existingUser.username, password: this.existingUser.password} as Credentials;
      const postData = JSON.stringify(creds);

      const opts = this.buildRequestOptions(postData);
      opts.path = "/api/auth";
      opts.method = "POST";

      const post = http.request(opts, (res) => {
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const data: any = JSON.parse(chunk.toString());
          data.token.should.exist;
          data.success.should.equal(true);
          res.statusCode.should.equal(200);
          done();
        });
      });

      post.write(postData);
      post.end();
    });
  }

  @test("Should fail login validation")
  public loginValidation(done: Function) {
    const creds = {username: "", password: this.existingUser.password} as Credentials;
    const postData = JSON.stringify(creds);

    const opts = this.buildRequestOptions(postData);
    opts.path = "/api/auth";
    opts.method = "POST";

    const post = http.request(opts, (res) => {
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        const data: any = JSON.parse(chunk.toString());
        data.error.should.equal("ValidationError");
        data.message.should.equal("Username is required.");
        res.statusCode.should.equal(400);
        done();
      });
    });

    post.write(postData);
    post.end();
  }

  @test("Should fail login authorization (password)")
  public loginAuthorizationPassword(done: Function) {
    const eu = new User(this.existingUser);
    eu.save().then(() => {
      const creds = {username: this.existingUser.username, password: "wrong"} as Credentials;
      const postData = JSON.stringify(creds);

      const opts = this.buildRequestOptions(postData);
      opts.path = "/api/auth";
      opts.method = "POST";

      const post = http.request(opts, (res) => {
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const data: any = JSON.parse(chunk.toString());
          data.error.should.equal("Unauthorized");
          res.statusCode.should.equal(401);
          done();
        });
      });

      post.write(postData);
      post.end();
    });
  }

  @test("Should fail login authorization (username)")
  public loginAuthorizationUsername(done: Function) {
    const eu = new User(this.existingUser);
    eu.save().then(() => {
      const creds = {username: "wrong", password: this.existingUser.password} as Credentials;
      const postData = JSON.stringify(creds);

      const opts = this.buildRequestOptions(postData);
      opts.path = "/api/auth";
      opts.method = "POST";

      const post = http.request(opts, (res) => {
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const data: any = JSON.parse(chunk.toString());
          data.error.should.equal("Unauthorized");
          res.statusCode.should.equal(401);
          done();
        });
      });

      post.write(postData);
      post.end();
    });
  }

  @test("Should fail login authorization (disabled)")
  public loginAuthorizationDisabled(done: Function) {
    this.existingUser.disabled = true;
    const eu = new User(this.existingUser);
    eu.save().then(() => {
      const creds = {username: this.existingUser.username, password: this.existingUser.password} as Credentials;
      const postData = JSON.stringify(creds);

      const opts = this.buildRequestOptions(postData);
      opts.path = "/api/auth";
      opts.method = "POST";

      const post = http.request(opts, (res) => {
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const data: any = JSON.parse(chunk.toString());
          data.error.should.equal("Unauthorized");
          res.statusCode.should.equal(401);
          done();
        });
      });

      post.write(postData);
      post.end();
    });
  }

  @test("Should get profile when logged in.")
  public getProfile(done: Function) {
    const eu = new User(this.existingUser);
    eu.save().then(user => {
      const creds = {username: this.existingUser.username, password: this.existingUser.password} as Credentials;
      const authPostData = JSON.stringify(creds);

      const authOpts = this.buildRequestOptions(authPostData);
      authOpts.path = "/api/auth";
      authOpts.method = "POST";

      const authPost = http.request(authOpts, (authRes) => {
        authRes.setEncoding("utf8");
        authRes.on("data", (chunk) => {
          const data: any = JSON.parse(chunk.toString());

          const profileOpts = this.buildRequestOptions("", data.token);
          profileOpts.path = "/api/auth/profile";
          profileOpts.method = "GET";

          const profileGet = http.request(profileOpts, (profileRes) => {
            profileRes.on("data", (chunk) => {
              const data: any = JSON.parse(chunk.toString());
              data.user.should.exist;
              data.user.username.should.equal(this.existingUser.username);
              profileRes.statusCode.should.equal(200);
              done();
            });
          });

          profileGet.write("");
          profileGet.end();
        });
      });

      authPost.write(authPostData);
      authPost.end();
    });
  }

  @test("Should deny profile without token.")
  public getProfileDenyNoToken(done: Function) {
    const opts = this.buildRequestOptions("");
    opts.path = "/api/auth/profile";
    opts.method = "GET";

    const get = http.request(opts, (res) => {
      res.on("data", (chunk) => {
        res.statusCode.should.equal(401);
        done();
      });
    });

    get.write("");
    get.end();
  }

  @test("Should deny profile with bad token.")
  public getProfileDenyBadToken(done: Function) {
    const opts = this.buildRequestOptions("", "JWT kdsjfaosdjajflkjasdlkfja");
    opts.path = "/api/auth/profile";
    opts.method = "GET";

    const get = http.request(opts, (res) => {
      res.on("data", (chunk) => {
        res.statusCode.should.equal(401);
        done();
      });
    });

    get.write("");
    get.end();
  }
}
