import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";
import * as path from "path";


/**
 * / route
 *
 * @class User
 */
export class IndexRoute extends BaseRoute {

  /**
   * Create the routes.
   *
   * @class IndexRoute
   * @method create
   * @static
   */
  public static create(router: Router, baseDir: string = null) {
    //log
    console.log("[IndexRoute::create] Creating index route.");

    //add home page route
    router.get("*", (req: Request, res: Response, next: NextFunction) => {
      new IndexRoute(baseDir).index(req, res, next);
    });
  }

  /**
   * Constructor
   *
   * @class IndexRoute
   * @constructor
   */
  constructor(baseDir: string = null) {
    super(baseDir);
  }

  /**
   * The home page route.
   *
   * @class IndexRoute
   * @method index
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @next {NextFunction} Execute the next method.
   */
  public index(req: Request, res: Response, next: NextFunction) {
    res.sendFile(path.join(this.baseDir, 'public/index.html'));
  }
}
