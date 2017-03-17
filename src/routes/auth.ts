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
import {IAuthenticatedRequest,ICredentials} from "../interfaces/auth";

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
      passport.authenticate("jwt", {session: false}), //authentication
      (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
        new AuthRoute(baseDir).profile(req, res, next);
      });
  }

  public validRealms: string[] = ["admin", "testing"]

  constructor(baseDir: string = null) {
    super(baseDir);
  }

  public auth(req: Request, res: Response, next: NextFunction) {
    let creds = req.body as ICredentials;

    //validation
    if (!creds || !creds.hasOwnProperty("username") || creds.username === "") {
      httpUtil.badRequest(res, "ValidationError", "Username is required.");
      return next();
    }
    if (!creds.hasOwnProperty("password") || creds.password === "") {
      httpUtil.badRequest(res, "ValidationError", "Password is required.");
      return next();
    }
    if (!authUtil.realmIsValid(creds.realm)) {
      httpUtil.badRequest(res, "ValidationError", "Invalid realm.");
      return next();
    }

    //do realm
    creds = authUtil.setCredentialRealm(creds);

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
          user = authUtil.scrubUserRealm(user);

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
    let newUser = new User(req.body);
    //validate realm
    if (!authUtil.realmIsValid(newUser.realm)) {
      httpUtil.badRequest(res, "ValidationError", "Invalid realm.");
      return next();
    }
    //add realm
    newUser = authUtil.setUserRealm(newUser);
    newUser.save().then(user => {
      res.json({success: true, message: "User registered."});
    }).catch(err => {
      validateUtil.validationError(err, res);
    });
  }

  public profile(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    let user: IUser = req.user;
    //scrub realm
    user = authUtil.scrubUserRealm(user);
    user.password = null;
    //also send profile
    res.json({user: user});
  }
}
