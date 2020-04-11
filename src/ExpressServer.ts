import express, { Router, Request, NextFunction, Response } from 'express'
import { Express } from 'express'
import { Server } from 'http'
import compress from 'compression'
import helmet from 'helmet'
import hpp from 'hpp'
import cors from 'cors'
import * as bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import RateLimit from 'express-rate-limit'
import noCache from 'nocache'
import UserRouters from './user/UserRouters'
import errorMiddleware from './middleware/ErrorMiddleware'
import session from 'express-session'

export class ExpressServer {

  private server?: Express
  private httpServer?: Server
  private router = Router()

  constructor() {
  }

  public setup(port: number) {
    this.loadRouters(this.router);

    this.server = express()

    this.setupStandardMiddlewares(this.server)
    this.setupSecurityMiddlewares(this.server)

    this.listen(this.server, port)
    this.server?.use('/api/v1', this.router)
  }

  public listen(server: Express, port: number) {
    console.info(`Starting server on port ${port}`)
    return server.listen(port)
  }

  public kill() {
    if (this.httpServer) this.httpServer.close()
  }

  private setupStandardMiddlewares(server: Express) {
    server.use(bodyParser.json())
    server.use(bodyParser.urlencoded({ extended: true }));
    server.use(cookieParser())
    server.use(compress())

    const baseRateLimitingOptions = {
      windowMs: 15 * 60 * 1000, // 15 min in ms
      max: 1000,
      message: 'Our API is rate limited to a maximum of 1000 requests per 15 minutes, please lower your request rate'
    }
    server.use('/api/*', RateLimit(baseRateLimitingOptions))

  }

  private setupSecurityMiddlewares(server: Express) {

    const options: cors.CorsOptions = {
      allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "X-Access-Token", "Set-Cookie"],
      credentials: true,
      methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
      preflightContinue: false
    };

    server.use(cors(options))
    server.use(hpp())
    server.use(helmet())
    server.use(helmet.referrerPolicy({ policy: 'same-origin' }))
    server.use(
      helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'unsafe-inline'"],
          scriptSrc: ["'unsafe-inline'", "'self'"]
        }
      })
    )
    server.use(noCache());
    server.use(errorMiddleware);
    // const expiryDate = new Date(Date.now() + 60 * 60 * 1000)
    // server.use(session({
    //   secret: 'keyboard cat',
    //   resave: false,
    //   saveUninitialized: true,
    //   cookie: { secure: true }
    // })
    // )
  }

  loadRouters(router: Router) {
    new UserRouters()
      .setRouter(router)
      .loadRouter()
  }
}