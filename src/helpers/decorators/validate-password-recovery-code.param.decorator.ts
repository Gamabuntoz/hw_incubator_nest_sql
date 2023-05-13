import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersRepository } from '../../public/users/users.repository';

@ValidatorConstraint({ name: 'ValidatePasswordRecoveryCode', async: true })
@Injectable()
export class ValidatePasswordRecoveryCodeRule
  implements ValidatorConstraintInterface
{
  constructor(private usersRepository: UsersRepository) {}

  async validate(value: string) {
    const user = await this.usersRepository.findUserByRecoveryCode(value);
    if (!user) return false;
    return user.passwordRecovery.expirationDate >= new Date();
  }
  defaultMessage() {
    return `Code is incorrect or expired`;
  }
}
