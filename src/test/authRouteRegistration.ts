import {suite, test} from "mocha-typescript";
import mongoose = require("mongoose");
import * as http from "http";
import {ICredentials} from "../interfaces/auth";
import {AuthTestBase} from "./authBase";

/**
 * This test suite must have the development server running!
 */
@suite("Auth route tests for Registration (over http)")
class AuthRouteRegistrationTest extends AuthTestBase {
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
  }
}
