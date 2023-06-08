import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { AuthRepository } from '../../public/auth/auth.repository';

@ValidatorConstraint({ name: 'LoginOrEmailExist', async: true })
@Injectable()
export class LoginOrEmailExistRule implements ValidatorConstraintInterface {
  constructor(private authRepository: AuthRepository) {}
  async validate(value: string) {
    const user = await this.authRepository.findUserByLoginOrEmail(value);
    return !user;
  }
  defaultMessage() {
    return `Already exist`;
  }
}
