import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { AuthRepository } from '../../public/auth/auth.repository';

@ValidatorConstraint({
  name: 'ValidateRegistrationConfirmationCode',
  async: true,
})
@Injectable()
export class ValidateRegistrationConfirmationCodeRule
  implements ValidatorConstraintInterface
{
  constructor(private usersRepository: AuthRepository) {}

  async validate(value: string) {
    const user = await this.usersRepository.findUserByConfirmationCode(value);
    if (!user) return false;
    if (user.expirationDate < new Date()) return false;
    return !user.isConfirmed;
  }
  defaultMessage() {
    return `Code is incorrect, expired or already been applied`;
  }
}
