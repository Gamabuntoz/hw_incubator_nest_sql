import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InputEmailForResendCodeDTO } from '../auth.dto';
import { UsersRepository } from '../../../users/users.repository';
import { EmailAdapter } from '../../../../adapters/email-adapter/email.adapter';
import { Result, ResultCode } from '../../../../helpers/contract';

export class PasswordRecoveryCommand {
  constructor(public inputData: InputEmailForResendCodeDTO) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCases
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailAdapter: EmailAdapter,
  ) {}

  async execute(command: PasswordRecoveryCommand): Promise<Result<boolean>> {
    let user = await this.usersRepository.findUserByLoginOrEmail(
      command.inputData.email,
    );
    if (!user)
      return new Result<boolean>(ResultCode.Success, true, 'User not found');
    await this.usersRepository.createPasswordRecoveryCode(user._id.toString());
    user = await this.usersRepository.findUserByLoginOrEmail(
      command.inputData.email,
    );
    await this.emailAdapter.sendEmailForPasswordRecovery(
      user.accountData.email,
      user.passwordRecovery?.code,
    );
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
