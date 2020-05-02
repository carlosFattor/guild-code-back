import { Schema, model } from "mongoose";
import { ISubscription } from "../../domains/subscription/Subscription.interface";

const SubscriptionSchema = new Schema({
  endpoint: {
    type: String,
    required: true
  },
  expirationTime: {
    type: String
  },
  keys: {
    p256dh: String,
    auth: String
  }
}, {
  timestamps: true,
});

const Subscription = model<ISubscription>("Subscription", SubscriptionSchema);
export default Subscription;