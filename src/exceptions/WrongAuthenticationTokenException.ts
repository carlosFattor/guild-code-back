import HttpException from "./HttpException";

class WrongAuthenticationTokenException extends HttpException {
  constructor() {
    super(401, "Wrong authentication token", null);
  }
}

export default WrongAuthenticationTokenException;