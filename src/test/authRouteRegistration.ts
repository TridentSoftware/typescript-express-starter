import {suite, test} from "mocha-typescript";
import mongoose = require("mongoose");
import axios from "axios";
import {AuthTestBase} from "./authBase";

/**
 * This test suite must have the development server running!
 */
@suite("Auth route tests for Registration (over http)")
class AuthRouteRegistrationTest extends AuthTestBase {
  @test("Should register successfully")
  public register(done: Function) {
    axios.post("/auth/register", this.registerData).then((res) =>{
      const data: any = res.data;
      data.success.should.equal(true);
      res.status.should.equal(200);
      done();
    });
  }

  @test("Should fail registration validation")
  public registerFailValid(done: Function) {
    delete this.registerData.firstName;
    delete this.registerData.lastName;

    axios.post("/auth/register", this.registerData).catch((err) =>{
      const res = err.response;
      const data: any = res.data;
      data.error.should.equal("ValidationError");
      data.errors.should.be.lengthOf(2);
      data.errors.should.have.deep.property("[0].field", "lastName");
      data.errors.should.have.deep.property("[1].field", "firstName");
      res.status.should.equal(400);
      done();
    });
  }

  @test("Should fail registration duplicate")
  public registerFailDuplicate(done: Function) {
    this.registerData.username = this.existingUser.username;

    axios.post("/auth/register", this.registerData).catch((err) =>{
      const res = err.response;
      const data: any = res.data;
      data.error.should.equal("Conflict");
      res.status.should.equal(409);
      done();
    });
  }
}
