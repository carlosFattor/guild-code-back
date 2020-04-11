import mongoose from 'mongoose';
import logger from '../logger/logger';

(<any>mongoose).Promise = global.Promise;

interface IOnConnectedCallback {
  (): void;
}

export default class MongoConnection {

  private readonly mongoUrl: string;
  private onConnectedCallback: IOnConnectedCallback | null = null;
  private isConnectedBefore: boolean = false;

  private readonly mongoConnectionOptions: mongoose.ConnectionOptions = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  };

  constructor(mongoUrl: string) {
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', true);
    }

    this.mongoUrl = mongoUrl;
    mongoose.connection.on('error', this.onError);
    mongoose.connection.on('disconnected', this.onDisconnected);
    mongoose.connection.on('connected', this.onConnected);
    mongoose.connection.on('reconnected', this.onReconnected);
  }

  public close(onClosed: (err: any) => void) {
    logger.log({
      level: 'info',
      message: 'Closing the MongoDB connection'
    });

    mongoose.connection.close(onClosed);
  }

  public connect(onConnectedCallback: IOnConnectedCallback) {
    this.onConnectedCallback = onConnectedCallback;
    this.startConnection();
  }

  private startConnection = () => {
    logger.log({
      level: 'info',
      message: `Connecting to MongoDB at ${this.mongoUrl}`
    });
    mongoose.connect(this.mongoUrl, this.mongoConnectionOptions).catch(() => { });
  }

  private onConnected = () => {
    logger.log({
      level: 'info',
      message: `Connected to MongoDB at ${this.mongoUrl}`
    });
    this.isConnectedBefore = true;
    if (this.onConnectedCallback) {
      this.onConnectedCallback();
    }
  };

  private onReconnected = () => {
    logger.log({
      level: 'info',
      message: 'Reconnected to MongoDB'
    });
    if (this.onConnectedCallback) {
      this.onConnectedCallback();
    }
  };

  private onError = () => {
    logger.log({
      level: 'error',
      message: `Could not connect to ${this.mongoUrl}`
    });
  };

  private onDisconnected = () => {
    if (!this.isConnectedBefore) {
      setTimeout(() => {
        this.startConnection();
      }, 2000);
      logger.log({
        level: 'info',
        message: 'Retrying mongo connection'
      });
    }
  };
}
