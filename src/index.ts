import "reflect-metadata";
import { Application } from "./Application";

Application.createApplication().then((PORT) => {
  console.info(`The application was started on localhost:${PORT}! Kill it using Ctrl + C`);
});