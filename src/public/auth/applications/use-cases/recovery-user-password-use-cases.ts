import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InputEmailForResendCodeDTO } from '../auth.dto';
import { AuthRepository } from '../../auth.repository';
import { EmailAdapter } from '../../../../adapters/email-adapter/email.adapter';
import { Result, ResultCode } from '../../../../helpers/contract';
import { Users } from '../../../../super_admin/sa_users/applications/users.entity';

export class PasswordRecoveryCommand {
  constructor(public inputData: InputEmailForResendCodeDTO) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCases
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private authRepository: AuthRepository,
    private emailAdapter: EmailAdapter,
  ) {}

  async execute(command: PasswordRecoveryCommand): Promise<Result<boolean>> {
    let user: Users = await this.authRepository.findUserByLoginOrEmail(
      command.inputData.email,
    );
    if (!user)
      return new Result<boolean>(ResultCode.Success, true, 'User not found');
    await this.authRepository.createPasswordRecoveryCode(user.id);
    user = await this.authRepository.findUserByLoginOrEmail(
      command.inputData.email,
    );
    await this.emailAdapter.sendEmailForPasswordRecovery(
      user.email,
      user.passwordRecoveryCode,
    );
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
