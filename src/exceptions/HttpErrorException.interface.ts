export default interface HttpErrorException extends Error {
  name: string;
  status: number;
  message: string;
  stack: string | undefined;
};
