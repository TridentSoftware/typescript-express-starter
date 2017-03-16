import {suite, test} from "mocha-typescript";
import mongoose = require("mongoose");
import * as http from "http";
import {ICredentials} from "../interfaces/auth";
import {AuthTestBase} from "./authBase";

/**
 * This test suite must have the development server running!
 */
@suite("Auth route tests for Authentication (over http)")
class AuthRouteAuthenticatonTest extends AuthTestBase {
  @test("Should login successfully")
  public login(done: Function) {
    const creds = {
      realm: AuthTestBase.realm,
      username: this.existingUser.username,
      password: this.existingUser.password
    } as ICredentials;

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
  }

  @test("Should fail login validation (username)")
  public loginValidationUsername(done: Function) {
    const creds = {
      realm: AuthTestBase.realm,
      username: "",
      password: this.existingUser.password
    } as ICredentials;

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

  @test("Should fail login validation (password)")
  public loginValidationPassword(done: Function) {
    const creds = {
      realm: AuthTestBase.realm,
      username: this.existingUser.username,
      password: ""
    } as ICredentials;

    const postData = JSON.stringify(creds);

    const opts = this.buildRequestOptions(postData);
    opts.path = "/api/auth";
    opts.method = "POST";

    const post = http.request(opts, (res) => {
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        const data: any = JSON.parse(chunk.toString());
        data.error.should.equal("ValidationError");
        data.message.should.equal("Password is required.");
        res.statusCode.should.equal(400);
        done();
      });
    });

    post.write(postData);
    post.end();
  }

  @test("Should fail login validation (realm)")
  public loginValidationRealm(done: Function) {
    const creds = {
      realm: "badrealm",
      username: this.existingUser.username,
      password: this.existingUser.password
    } as ICredentials;

    const postData = JSON.stringify(creds);

    const opts = this.buildRequestOptions(postData);
    opts.path = "/api/auth";
    opts.method = "POST";

    const post = http.request(opts, (res) => {
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        const data: any = JSON.parse(chunk.toString());
        data.error.should.equal("ValidationError");
        data.message.should.equal("Invalid realm.");
        res.statusCode.should.equal(400);
        done();
      });
    });

    post.write(postData);
    post.end();
  }

  @test("Should fail login authorization (password)")
  public loginAuthorizationPassword(done: Function) {
    const creds = {
      realm: AuthTestBase.realm,
      username: this.existingUser.username,
      password: "wrong"
    } as ICredentials;

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
  }

  @test("Should fail login authorization (username)")
  public loginAuthorizationUsername(done: Function) {
    const creds = {
      realm: AuthTestBase.realm,
      username: "wrong",
      password: this.existingUser.password
    } as ICredentials;

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
  }

  @test("Should fail login authorization (disabled)")
  public loginAuthorizationDisabled(done: Function) {
    this.existingUserInDb.disabled = true;
    this.existingUserInDb.save().then(() => {
      //user disabled, do test
      const creds = {
        realm: AuthTestBase.realm,
        username: this.existingUser.username,
        password: this.existingUser.password
      } as ICredentials;

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
}
