import {NextFunction, Request, Response, Router} from "express";
import {BaseRoute} from "./route";
import {httpUtil} from "../util/http";
import {User} from "../models/user";
import {authUtil, AuthenticatedRequest} from "../util/auth";
import {dbUtil} from "../util/database";
import {dbconfig} from "../config/database";
import jwt = require("jsonwebtoken");
import {IUser} from "../interfaces/user";
import * as passport from "passport";

export class AuthRoute extends BaseRoute {

  public static create(router: Router) {
    console.log("[AuthRoute::create] Creating auth route.");

    //login
    router.post("/auth", (req: Request, res: Response, next: NextFunction) => {
      new AuthRoute().auth(req, res, next);
    });
    //register
    router.post("/auth/register", (req: Request, res: Response, next: NextFunction) => {
      new AuthRoute().register(req, res, next);
    });
    //profile
    router.get("/user/profile",
      passport.authenticate('jwt', {session:false}),
      (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      new AuthRoute().profile(req, res, next);
    });
  }

  constructor() {
    super();
  }

  public auth(req: Request, res: Response, next: NextFunction) {
    const credentials = req.body;

    if (!credentials || !credentials.username || credentials.username === '') {
      httpUtil.badRequest(res, 'ValidationError', 'Username is required.');
      return next();
    }
    if (!credentials.password || credentials.password === '') {
      httpUtil.badRequest(res, 'ValidationError', 'Password is required.');
      return next();
    }

    const query = {username: credentials.username, deleted: false};
    User.findOne(query, (err: any, user: IUser) => {
      if (err) throw err;
      if (!user) {
        httpUtil.unauthorized(res, 'Invalid username or password.');
        return next();
      }
      if (user.disabled) {
        httpUtil.unauthorized(res, 'Invalid username or password.');
        return next();
      }

      // For lockout logic
      // authUtil.calculateLockout(login);
      //
      // if (login.lockedOut){
      //     res.json({success: false, message: 'User account locked.'});
      //     return;
      // }

      authUtil.loginAttempt(user);

      user.comparePassword(credentials.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          authUtil.loginSuccess(user);

          const token = jwt.sign(user, dbconfig.secret, {
            expiresIn: 604800
          });

          const resUser = {
            firstName: user.firstName,
            lastName: user.lastName,
            displayName: user.displayName,
            username: user.username,
            email: user.email
          };
          res.json({
            success: true,
            message: 'User signed in.',
            token: 'JWT ' + token,
            user: resUser
          })
        } else {
          httpUtil.unauthorized(res, 'Invalid username or password.');
        }
      });
    });
  }

  public register(req: Request, res: Response, next: NextFunction) {
    const newUser = new User(req.body);
    newUser.save((err: any, user: IUser) => {
      if (err) {
        dbUtil.validationError(err, res);
        return next();
      }
      res.json({success: true, message: 'User registered.'});
    });
  }

  public profile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const user: IUser = req.user;
    user.password = null;
    //also send profile
    res.json({user: user, profile: null});
  }
}
