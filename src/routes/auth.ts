import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";

export class AuthRoute extends BaseRoute {

  public static create(router: Router) {
    //log
    console.log("[IndexRoute::create] Creating index route.");

    //add home page route
    router.get("/auth", (req: Request, res: Response, next: NextFunction) => {
      new AuthRoute().auth(req, res, next);
    });
  }

  constructor() {
    super();
  }

  public auth(req: Request, res: Response, next: NextFunction) {

  }
}
