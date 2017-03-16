import {suite, test} from "mocha-typescript";
import mongoose = require("mongoose");
import * as http from "http";
import {ICredentials} from "../interfaces/auth";
import {AuthTestBase} from "./authBase";

/**
 * This test suite must have the development server running!
 */
@suite("Auth route tests for Profile (over http)")
class AuthRouteProfileTest extends AuthTestBase {
  @test("Should get profile when logged in.")
  public getProfile(done: Function) {
    const creds = {
      realm: AuthTestBase.realm,
      username: this.existingUser.username,
      password: this.existingUser.password
    } as ICredentials;

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
          profileRes.setEncoding("utf8");
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
  }

  @test("Should deny profile without token.")
  public getProfileDenyNoToken(done: Function) {
    const opts = this.buildRequestOptions("");
    opts.path = "/api/auth/profile";
    opts.method = "GET";

    const get = http.request(opts, (res) => {
      res.setEncoding("utf8");
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
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        res.statusCode.should.equal(401);
        done();
      });
    });

    get.write("");
    get.end();
  }
}
