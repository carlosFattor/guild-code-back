import { Schema, model } from "mongoose";
import { ISubscription } from "../../domains/subscription/Subscription.interface";

const SubscriptionSchema = new Schema({
  email: {
    type: String,
    unique: true
  },

  subscriptions: {
    type: [{
      endpoint: String,
      expirationTime: String,
      device: String,
      keys: {
        p256dh: String,
        auth: String
      }
    }
    ]
  }
}, {
  timestamps: true,
});

const Subscription = model<ISubscription>("Subscription", SubscriptionSchema);
export default Subscription;