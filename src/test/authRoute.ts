/*
import {suite, test} from "mocha-typescript";
import {dbconfig} from "../config/database";
import mongoose = require("mongoose");
import {NextFunction, Request, Response, Router} from "express";
import {AuthRoute} from "../routes/auth";
import {IUser} from "../interfaces/user";
import {User} from "../models/user";

@suite("Auth route")
class AuthRouteTest {
  private data: IUser;
  private route: AuthRoute;

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
    //configure route
    this.route = new AuthRoute();
  }

  @test("should be able to register")
  public create(done: Function) {
    const next = () => {};
    let req = {} as Request;
    let res = {
      viewName: "",
      status: null,
      data: {},
      render: function (view, viewData) {
        this.viewName = view;
        this.data = viewData;
      }
    } as Response;

    req.body = this.data;

    this.route.register(req, res, next);
  }
}
*/
