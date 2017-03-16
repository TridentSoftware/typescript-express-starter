import {NextFunction, Request, Response, Router} from "express";
import {BaseRoute} from "./route";
import {httpUtil} from "../util/http";
import {User} from "../models/user";
import {authUtil} from "../util/auth";
import {validateUtil} from "../util/validate";
import * as config from "config";
import * as passport from "passport";
import {IUser} from "../interfaces/user";
import jwt = require("jsonwebtoken");
import {AuthenticatedRequest,Credentials} from "../interfaces/auth";

export class AuthRoute extends BaseRoute {

  public static create(router: Router, baseDir: string = null) {
    console.log("[AuthRoute::create] Creating auth route.");

    //login
    router.post("/auth", (req: Request, res: Response, next: NextFunction) => {
      new AuthRoute(baseDir).auth(req, res, next);
    });
    //register
    router.post("/auth/register", (req: Request, res: Response, next: NextFunction) => {
      new AuthRoute(baseDir).register(req, res, next);
    });
    //profile
    router.get("/auth/profile",
      passport.authenticate("jwt", {session: false}),
      (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        new AuthRoute(baseDir).profile(req, res, next);
      });
  }

  public validRealms: string[] = ["admin", "testing"]

  constructor(baseDir: string = null) {
    super(baseDir);
  }

  public auth(req: Request, res: Response, next: NextFunction) {
    const creds = req.body as Credentials;

    //validation
    if (!creds || !creds.hasOwnProperty("username") || creds.username === "") {
      httpUtil.badRequest(res, "ValidationError", "Username is required.");
      return next();
    }
    if (!creds.hasOwnProperty("password") || creds.password === "") {
      httpUtil.badRequest(res, "ValidationError", "Password is required.");
      return next();
    }
    if (creds.hasOwnProperty("realm") && creds.realm.length > 0 && this.validRealms.indexOf(creds.realm) == -1) {
      httpUtil.badRequest(res, "ValidationError", "Invalid realm.");
      return next();
    }

    //if we need a realm, add it
    if (creds.realm)
      creds.username = [creds.realm, creds.username].join(":");

    //regex for username ignore case
    const usernameRegex: RegExp = new RegExp(["^", creds.username, "$"].join(""), "i");
    let query = {
      username: usernameRegex,
      deleted: false
    };

    //go find them
    User.findOne(query).then(user => {
      if (!user) {
        //httpUtil.notFound(res, "User not found.");
        httpUtil.unauthorized(res, "Invalid username or password.");
        return next();
      }
      if (user.disabled) {
        httpUtil.unauthorized(res, "Invalid username or password.");
        return next();
      }

      // For lockout logic
      // authUtil.calculateLockout(login);
      //
      // if (login.lockedOut){
      //     httpUtil.unauthorized(res, "User account locked."});
      //     return;
      // }

      authUtil.loginAttempt(user);

      user.comparePassword(creds.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          authUtil.loginSuccess(user);

          const token = jwt.sign(user, config.get("app.secret"), {
            expiresIn: 604800 //a week (in seconds)
          });

          //scrub realm
          if (user.realm && user.realm.length > 0)
            user.username = user.username.replace(user.realm + ":", "");

          //return user
          const resUser = {
            firstName: user.firstName,
            lastName: user.lastName,
            displayName: user.displayName,
            username: user.username,
            email: user.email
          };
          res.json({
            success: true,
            message: "User signed in.",
            token: "JWT " + token,
            user: resUser
          })
        } else {
          httpUtil.unauthorized(res, "Invalid username or password.");
        }
      });
    });
  }

  public register(req: Request, res: Response, next: NextFunction) {
    const newUser = new User(req.body);
    //validate realm
    if (newUser.hasOwnProperty("realm") && newUser.realm.length > 0 && this.validRealms.indexOf(newUser.realm) == -1) {
      httpUtil.badRequest(res, "ValidationError", "Invalid realm.");
      return next();
    }
    //add realm
    if (newUser.realm && newUser.realm.length > 0)
      newUser.username = [newUser.realm, newUser.username].join(":");
    newUser.save().then(user => {
      res.json({success: true, message: "User registered."});
    }).catch(err => {
      validateUtil.validationError(err, res);
    });
  }

  public profile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const user: IUser = req.user;
    //scrub realm
    if (user.realm && user.realm.length > 0)
      user.username = user.username.replace(user.realm + ":", "");
    user.password = null;
    //also send profile
    res.json({user: user});
  }
}
