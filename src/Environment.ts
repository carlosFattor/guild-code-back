import * as dotenv from 'dotenv';

export class Environment {

  constructor() {
    dotenv.config();
  }

  public getPort(): number {
    return (process.env.PORT as any) || 3000
  }

  public getMongoUser(): string | undefined {
    return process.env.MONGO_USER
  }

  public getMongoPassword(): string | undefined {
    return process.env.MONGO_PASSWORD
  }

  public getMongoPath(): string | undefined {
    return process.env.MONGO_PATH
  }

  public getSecret(): string {
    return process.env.SECRET || ''
  }

  public getClientId(): string {
    return process.env.CLIENT_ID || ''
  }

  public getClientSecret(): string {
    return process.env.CLIENT_SECRET || ''
  }

}