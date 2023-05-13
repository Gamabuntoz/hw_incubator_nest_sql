import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersRepository } from '../../public/users/users.repository';

@ValidatorConstraint({ name: 'ValidateEmailForResendCode', async: true })
@Injectable()
export class ValidateEmailForResendCodeRule
  implements ValidatorConstraintInterface
{
  constructor(private usersRepository: UsersRepository) {}
  async validate(value: string) {
    const user = await this.usersRepository.findUserByLoginOrEmail(value);
    if (!user) return false;
    return !user.emailConfirmation.isConfirmed;
  }
  defaultMessage() {
    return `User not found or user already confirmed`;
  }
}
