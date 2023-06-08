import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { AuthRepository } from '../../public/auth/auth.repository';

@ValidatorConstraint({ name: 'ValidatePasswordRecoveryCode', async: true })
@Injectable()
export class ValidatePasswordRecoveryCodeRule
  implements ValidatorConstraintInterface
{
  constructor(private usersRepository: AuthRepository) {}

  async validate(value: string) {
    const user = await this.usersRepository.findUserByRecoveryCode(value);
    if (!user) return false;
    return user.expirationDate >= new Date();
  }
  defaultMessage() {
    return `Code is incorrect or expired`;
  }
}
