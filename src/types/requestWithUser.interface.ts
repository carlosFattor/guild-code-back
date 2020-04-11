import { Request } from 'express';
import { IUser } from '../user/base/IUser';

interface RequestWithUser extends Request {
  user: IUser;
}

export default RequestWithUser;