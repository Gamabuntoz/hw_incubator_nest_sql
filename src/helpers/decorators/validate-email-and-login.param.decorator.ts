import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersRepository } from '../../public/users/users.repository';

@ValidatorConstraint({ name: 'LoginOrEmailExist', async: true })
@Injectable()
export class LoginOrEmailExistRule implements ValidatorConstraintInterface {
  constructor(private usersRepository: UsersRepository) {}
  async validate(value: string) {
    const user = await this.usersRepository.findUserByLoginOrEmail(value);
    return !user;
  }
  defaultMessage() {
    return `Already exist`;
  }
}
