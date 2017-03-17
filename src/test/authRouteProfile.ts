import {suite, test} from "mocha-typescript";
import mongoose = require("mongoose");
import axios from "axios";
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

    axios.post("/auth", creds).then((res) => {
      const data: any = res.data;
      axios.get("/auth/profile", {
        headers: {"Authorization": data.token}
      }).then((res) => {
        const data: any = res.data;
        data.user.should.exist;
        data.user.username.should.equal(this.existingUser.username);
        res.status.should.equal(200);
        done();
      })
    });
  }

  @test("Should deny profile without token.")
  public getProfileDenyNoToken(done: Function) {
    axios.get("/auth/profile").catch((err) => {
      const res = err.response;
      res.status.should.equal(401);
      done();
    });
  }

  @test("Should deny profile with bad token.")
  public getProfileDenyBadToken(done: Function) {
    axios.get("/auth/profile", {
      headers: {"Authorization": "JWT kdsjfaosdjajflkjasdlkfja"}
    }).catch((err) => {
      const res = err.response;
      res.status.should.equal(401);
      done();
    });
  }
}
