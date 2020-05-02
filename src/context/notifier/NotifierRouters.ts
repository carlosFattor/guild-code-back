import BaseRouters from "../../types/BaseRouters";
import { Router } from "express";
import NotifierController from "./NotifierController";

export default class NotifierRoutes implements BaseRouters {

  path = "/notifier";
  private router: Router | null = null;
  private notifierController: NotifierController | null = null;

  constructor() {
    this.notifierController = new NotifierController();
  }

  setRouter(_router: Router): NotifierRoutes {
    this.router = _router;
    return this;
  }

  loadRouter(): void {
    this.router?.get(`${this.path}/health`, async (req, res) => this.notifierController?.getHealth(req, res));
    this.router?.post(`${this.path}/subscriber`, async (req, res, next) => this.notifierController?.saveSubscriber(req, res, next));
    this.router?.post(`${this.path}/subscriber/notify`, async (req, res, next) => this.notifierController?.sendToSubscriber(req, res, next));
  }

}