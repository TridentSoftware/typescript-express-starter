import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";
import * as path from "path";
import * as cors from "cors";
import * as helmet from "helmet";
import * as passport from "passport";
import * as winston from "winston";
import * as expressWinston from "express-winston";
import errorHandler = require("errorhandler");
import methodOverride = require("method-override");
import mongoose = require("mongoose"); //import mongoose

//config
import * as config from "config";
import {configureJwt} from "./config/passport";

//routes
import {IndexRoute} from "./routes/index";
import {AuthRoute} from "./routes/auth";

/**
 * The server.
 *
 * @class Server
 */
export class Server {

  public app: express.Application;

  /**
   * Bootstrap the application.
   *
   * @class Server
   * @method bootstrap
   * @static
   * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
   */
  public static bootstrap(): Server {
    return new Server();
  }

  /**
   * Constructor.
   *
   * @class Server
   * @constructor
   */
  constructor() {
    //create expressjs application
    this.app = express();

    //configure application
    this.config();

    //add api
    this.api();

    //add routes
    this.routes();

    //error handling
    this.handleErrors();
  }

  /**
   * Create REST API routes
   *
   * @class Server
   * @method api
   */
  public api() {
    let router: express.Router;
    router = express.Router();

    AuthRoute.create(router);

    //use router middleware
    this.app.use("/api", router);
  }

  /**
   * Configure application
   *
   * @class Server
   * @method config
   */
  public config() {
    //cors
    this.app.use(cors());
    //helmet
    this.app.use(helmet());

    //add static paths
    this.app.use(express.static(path.join(__dirname, "public")));

    //configure hbs
    this.app.set("views", path.join(__dirname, "views"));
    this.app.set("view engine", "hbs");

    //mount logger
    //noinspection TypeScriptValidateTypes
    this.app.use(logger("dev"));

    //mount json form parser
    this.app.use(bodyParser.json());

    //mount query string parser
    this.app.use(bodyParser.urlencoded({
      extended: true
    }));

    //mount cookie parker
    const secret = config.get("app.secret")
    this.app.use(cookieParser(secret));

    //passport middleware
    this.app.use(passport.initialize());
    this.app.use(passport.session());
    //jwt
    configureJwt(passport);

    //mount override
    //this.app.use(methodOverride());

    //use q promises
    global.Promise = require("q").Promise;
    mongoose.Promise = global.Promise;

    //connect to mongoose
    const connection = config.get("database.connection");
    mongoose.connect(connection);
    mongoose.connection.on("connected", () => {
      console.log("Connected to database " + connection);
    });
    mongoose.connection.on("error", (err) => {
      console.log("Database error " + err);
    });

    // catch 404 and forward to error handler
    this.app.use(function (err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
      err.status = 404;
      next(err);
    });
  }

  /**
   * Create and return Router.
   *
   * @class Server
   * @method config
   * @return void
   */
  private routes() {
    let router: express.Router;
    router = express.Router();

    //IndexRoute
    IndexRoute.create(router);

    //use router middleware
    this.app.use(router);
  }

  private handleErrors() {
    // express-winston errorLogger makes sense AFTER the router.
    //noinspection TypeScriptUnresolvedFunction
    this.app.use(expressWinston.errorLogger({
      transports: [
        new winston.transports.Console({
          json: true,
          colorize: true
        })
      ]
    }));

    //error handling
    this.app.use(errorHandler());
  }
}
