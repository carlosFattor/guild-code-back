import express, { Router, Request, Response, NextFunction } from "express";
import { Express } from "express";
import { Server } from "http";
import compress from "compression";
import helmet from "helmet";
import hpp from "hpp";
import cors from "cors";
import * as bodyParser from "body-parser";
import RateLimit from "express-rate-limit";
import noCache from "nocache";
import UserRouters from "./context/user/UserRouters";
import errorMiddleware from "./middleware/ErrorMiddleware";
import HttpException from "exceptions/HttpException";
import NotifierRoutes from "./context/notifier/NotifierRouters";

export default class ExpressServer {

  private server?: Express
  private httpServer?: Server
  private router = Router();

  public setup(port: number) {
    this.loadRouters(this.router);

    this.server = express();

    this.setupStandardMiddleware(this.server);
    this.setupSecurityMiddleware(this.server);

    this.listen(this.server, port);
    this.server?.use("/api/v1", this.router);
  }

  public listen(server: Express, port: number) {
    console.info(`Starting server on port ${port}`);
    return server.listen(port);
  }

  public kill() {
    if (this.httpServer) this.httpServer.close();
  }

  private setupStandardMiddleware(server: Express) {
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));
    server.use(compress());

    const baseRateLimitingOptions = {
      windowMs: 15 * 60 * 1000, // 15 min in ms
      max: 1000,
      message: "Our API is rate limited to a maximum of 1000 requests per 15 minutes, please lower your request rate"
    };
    server.use("/api/*", RateLimit(baseRateLimitingOptions));
  }

  private setupSecurityMiddleware(server: Express) {

    const options: cors.CorsOptions = {
      allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Authorization"],
      origin: [
        "https://guild-code.netlify.app",
        "https://www.guild-code.com.br",
        "http://localhost:4200"
      ],
      methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE"
    };

    server.use(cors(options));
    server.use(hpp());
    server.use(helmet());
    server.use(helmet.referrerPolicy({ policy: "same-origin" }));
    server.use(
      helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'unsafe-inline'"],
          scriptSrc: ["'unsafe-inline'", "'self'"]
        }
      })
    );
    server.use(noCache());
    server.disable("x-powered-by");
    server.use(function (error: HttpException, req: Request, res: Response, next: NextFunction) {
      errorMiddleware(error, req, res, next);
    });
  }

  loadRouters(router: Router) {
    new UserRouters()
      .setRouter(router)
      .loadRouter();

    new NotifierRoutes()
      .setRouter(router)
      .loadRouter();
  }
}