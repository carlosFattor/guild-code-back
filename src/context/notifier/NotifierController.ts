import * as HttpStatus from "http-status-codes";
import { Request, Response, NextFunction } from "express";
import * as WebPush from "web-push";
import Environment from "../../Environment";
import NotifierService from "./NotifierService";
import HttpException from "../../exceptions/HttpException";
import { Notify } from "../../domains/Notify";
import { ISubscription, Subscriptions } from "../../domains/subscription/Subscription.interface";

export default class NotifierController {

  ENV: Environment | null = null;
  private publicVapidKey = "";
  private privateVapidKey = "";
  private notifierService: NotifierService | null = null;

  constructor() {
    this.ENV = new Environment();
    this.publicVapidKey = this.ENV.getPublicVapidKey();
    this.privateVapidKey = this.ENV.getPrivateVapidKey();
    this.notifierService = new NotifierService();
  }

  async getHealth(req: Request, res: Response): Promise<void> {

    return res.status(HttpStatus.OK).end();
  }

  async verifySubscriber(req: Request, res: Response, next: NextFunction) {
    try {
      const email = req.params.email;
      const device = req.params.device;
      if (email && device) {
        const notify = await this.notifierService?.verifySubscriber(email, device);
        if (notify) {
          const subscription = notify.subscriptions.find(sub => {
            return sub.device === device;
          });
          return res.status(HttpStatus.OK).json({ found: true, subscription });
        }
        return res.status(HttpStatus.OK).json({ found: false });
      }
      throw new HttpException(HttpStatus.NOT_FOUND, "Error trying get subscriber status", null);
    } catch (error) {
      next(new HttpException(404, error.message, error));
    }
  }

  async saveSubscriber(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

      const { subscriber, email, device } = req.body;
      const subscription: Subscriptions = {
        ...subscriber, device
      };

      const sub = {
        email,
        subscriptions: [
          subscription
        ]
      } as ISubscription;

      const notify = await this.notifierService?.verifySubscriber(email, device);
      if (notify) {

        const channel = notify.subscriptions.filter(_sub => {
          return _sub.device === subscription.device;
        });

        if (channel.length > 0) {
          return res.status(HttpStatus.NO_CONTENT).end();
        }
        this.notifierService?.updateSubscription(email, subscription);
        return res.status(HttpStatus.OK).end();
      }
      await this.notifierService?.addSubscription(sub);
      return res.status(HttpStatus.OK).end();

    } catch (error) {
      next(new HttpException(404, "It was impossible save subscription", error));
    }
  }

  async sendToSubscriber(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notify: Notify = req.body;
      WebPush.setVapidDetails("https://guild-code.netlify.app", this.publicVapidKey, this.privateVapidKey);

      const notifier = await this.notifierService?.fetchAll();
      const notificationPayload = {
        "notification": {
          "title": notify.title,
          "body": notify.body,
          "icon": notify.icon,
          "vibrate": [300, 100, 400, 100, 400, 100, 400],
          "data": {
            "dateOfArrival": Date.now(),
            "primaryKey": 1,
            "url": notify.url
          },
          "requireInteraction": true,
          "actions": [{
            "action": "explore",
            "title": "Go to the site"
          }]
        }
      };
      if (notifier) {
        notifier.forEach(subs => {
          Promise.all(subs.subscriptions.map(sub => WebPush.sendNotification(
            sub, JSON.stringify(notificationPayload))))
            .then(() => res.status(HttpStatus.OK).json({ message: "Newsletter sent successfully." }))
            .catch(err => {
              console.error("Error sending notification, reason: ", err);
              res.sendStatus(500);
            });

        });
      }
    } catch (error) {
      next(new HttpException(404, "It was impossible notifier the user", error));
    }
  }
}