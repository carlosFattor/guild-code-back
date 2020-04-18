import HttpErrorException from "./HttpErrorException.interface";
export default class HttpException implements HttpErrorException {
  status: number;
  message: string;
  stack: string | undefined;
  name = "";
  constructor(status: number, message: string, stack: Error | null) {
    this.status = status;
    this.message = message;
    this.stack = (stack) ? stack.message : undefined;
  }
}
