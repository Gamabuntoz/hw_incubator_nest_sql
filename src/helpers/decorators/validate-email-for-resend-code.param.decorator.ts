import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { AuthRepository } from '../../public/auth/auth.repository';

@ValidatorConstraint({ name: 'ValidateEmailForResendCode', async: true })
@Injectable()
export class ValidateEmailForResendCodeRule
  implements ValidatorConstraintInterface
{
  constructor(private usersRepository: AuthRepository) {}
  async validate(value: string) {
    const user = await this.usersRepository.findUserByLoginOrEmail(value);
    if (!user) return false;
    return !user.isConfirmed;
  }
  defaultMessage() {
    return `User not found or user already confirmed`;
  }
}
