import { Request } from 'express';
import { IUser } from '../context/user/base/IUser';

interface RequestWithUser extends Request {
  user?: IUser;
}

export default RequestWithUser;