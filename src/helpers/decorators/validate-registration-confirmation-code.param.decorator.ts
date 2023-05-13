import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersRepository } from '../../public/users/users.repository';

@ValidatorConstraint({
  name: 'ValidateRegistrationConfirmationCode',
  async: true,
})
@Injectable()
export class ValidateRegistrationConfirmationCodeRule
  implements ValidatorConstraintInterface
{
  constructor(private usersRepository: UsersRepository) {}

  async validate(value: string) {
    const user = await this.usersRepository.findUserByConfirmationCode(value);
    if (!user) return false;
    if (user.emailConfirmation.expirationDate < new Date()) return false;
    return !user.emailConfirmation.isConfirmed;
  }
  defaultMessage() {
    return `Code is incorrect, expired or already been applied`;
  }
}
