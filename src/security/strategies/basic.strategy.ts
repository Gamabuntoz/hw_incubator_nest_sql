import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { basicConstants } from '../../helpers/constants';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'basic') {
  constructor() {
    super();
  }
  public validate = async (username, password) => {
    if (
      basicConstants.adminName === username &&
      basicConstants.adminPass === password
    ) {
      return true;
    }
    throw new UnauthorizedException();
  };
}
