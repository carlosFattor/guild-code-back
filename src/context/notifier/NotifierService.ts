import Environment from "../../Environment";
import { ISubscription, Subscriptions } from "../../domains/subscription/Subscription.interface";
import Subscription from "./SubscriptionModel";
import HttpException from "../../exceptions/HttpException";
import * as HttpStatus from "http-status-codes";

export default class NotifierService {

  private environment: Environment | null = null;

  constructor() {
    this.environment = new Environment();
  }

  async verifySubscriber(email: string): Promise<ISubscription | null> {
    try {
      const data = await Subscription.findOne({ email });
      return data;
    } catch (error) {
      throw new HttpException(HttpStatus.BAD_REQUEST, error.message, error);
    }
  }

  async verifySubscriberAndDevice(email: string, device: string): Promise<ISubscription | null> {
    try {
      const data = await Subscription.findOne({ email, subscriptions: { $elemMatch: { device } } });
      return data;
    } catch (error) {
      throw new HttpException(HttpStatus.BAD_REQUEST, error.message, error);
    }
  }

  async addSubscription(sub: ISubscription): Promise<ISubscription> {
    try {
      const temp = new Subscription(sub);
      const data = await temp.save();
      return data;
    } catch (error) {
      throw new HttpException(HttpStatus.BAD_REQUEST, error.message, error);
    }
  }

  async updateSubscription(email: string, subscription: Subscriptions): Promise<ISubscription | null> {
    try {
      const query = { email };
      const update = { $push: { subscriptions: subscription } };
      const subUpdated = await Subscription.findOneAndUpdate(query, update);
      return subUpdated;
    } catch (error) {
      throw new HttpException(HttpStatus.BAD_REQUEST, error.message, error);
    }
  }

  async fetchAll(): Promise<Array<ISubscription>> {
    try {
      const subs = await Subscription.find({});
      return subs;
    } catch (error) {
      throw new HttpException(HttpStatus.BAD_REQUEST, error.message, error);
    }
  }
}