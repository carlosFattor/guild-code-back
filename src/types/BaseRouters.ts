import { Router } from "express";

export default interface BaseRouters {
  path: string;
  setRouter(_router: Router): void;
  loadRouter(): void;
}