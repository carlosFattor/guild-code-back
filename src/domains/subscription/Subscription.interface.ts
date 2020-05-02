import { Document } from "mongoose";
import { KeysSubscription } from "./Keys.interface";

export interface Subscription {
  endpoint: string;
  expirationTime: string;
  keys: KeysSubscription;
}

export type ISubscription = Subscription & Document 