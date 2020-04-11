import { Router } from "express";

export interface BaseRouter {
  path: String;
  router: Router
}