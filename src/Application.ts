import "reflect-metadata";
import { ExpressServer } from "./ExpressServer";
import { Environment } from "./Environment";
import MongoConnection from "./db/MongoConnection";

export class Application {

  public static async createApplication(): Promise<number> {

    const ENV = new Environment();
    const PORT = ENV.getPort();

    const URI = `mongodb+srv://${ENV.getMongoUser()}:${ENV.getMongoPassword()}${ENV.getMongoPath()}`;
    const mongoose = new MongoConnection(URI);

    mongoose.connect(() => {
      const expressServer = new ExpressServer();
      expressServer.setup(PORT);
      Application.handleExit(expressServer);
    });

    return PORT;
  }

  private static handleExit(express: ExpressServer) {
    process.on("uncaughtException", (err: Error) => {
      console.error("Uncaught exception", err);
      Application.shutdownProperly(1, express);
    });
    process.on("unhandledRejection", (reason: {} | null | undefined) => {
      console.error("Unhandled Rejection at promise", reason);
      Application.shutdownProperly(2, express);
    });
    process.on("SIGINT", () => {
      console.info("Caught SIGINT");
      Application.shutdownProperly(128 + 2, express);
    });
    process.on("exit", () => {
      console.info("Exiting");
    });
  }

  private static shutdownProperly(exitCode: number, express: ExpressServer) {
    Promise.resolve()
      .then(() => express.kill())
      .then(() => {
        console.info("Shutdown complete");
        process.exit(exitCode);
      })
      .catch(err => {
        console.error("Error during shutdown", err);
        process.exit(1);
      });
  }
}