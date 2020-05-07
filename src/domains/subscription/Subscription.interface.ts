import { Document } from "mongoose";
import { KeysSubscription } from "./Keys.interface";

export interface Subscription {
  email?: string;
  subscriptions: Subscriptions[];
}

export interface Subscriptions {
  device: string;
  endpoint: string;
  expirationTime: string;
  keys: KeysSubscription;
  status: boolean;
}

export type ISubscription = Subscription & Document 