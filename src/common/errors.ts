export class ServerError extends Error {
  message: string;
  status: number;
  data?: any;

  constructor(status: number, message: string = '', data?: any) {
    super();
    this.status = status;
    this.message = message;
    this.data = data;
  }
}

export class UnauthorizedError extends ServerError {
  constructor(message: string = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenError extends ServerError {
  constructor(message: string = 'Forbidden') {
    super(403, message);
  }
}

export class BadRequestError extends ServerError {
  constructor(message: string = 'Bad Request') {
    super(400, message);
  }
}

// error failure response function
export class FailureError extends Error {
  message: string;
  data?: any;
  constructor(message: string = '', data?: any) {
    super();
    this.message = message;
    this.data = data;
  }
}
