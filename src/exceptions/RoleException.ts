import HttpException from "./HttpException";
export default class RoleException extends HttpException {
  constructor() {
    super(403, "You don't have permission!", null);
  }
}