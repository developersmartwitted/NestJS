import { HttpStatus } from '@nestjs/common';

import HttpResponse from './response.http';

export default class HttpOkResponse extends HttpResponse {
  constructor(data?: any, message?: string) {
    super(data, HttpStatus.OK, message);
  }
}
