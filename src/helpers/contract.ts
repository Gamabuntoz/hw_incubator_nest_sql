import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export enum ResultCode {
  Success,
  Forbidden,
  NotFound,
  BadRequest,
  Unauthorized,
}

export class Result<T> {
  constructor(
    public code: number,
    public data: T | null,
    public errorMessage: string | null,
  ) {}

  static sendResultError(result: number) {
    switch (result) {
      case ResultCode.NotFound:
        throw new NotFoundException();
      case ResultCode.Forbidden:
        throw new ForbiddenException();
      case ResultCode.BadRequest:
        throw new BadRequestException();
      case ResultCode.Unauthorized:
        throw new UnauthorizedException();
    }
  }
}
