import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InputEmailForResendCodeDTO } from '../auth.dto';
import { UsersRepository } from '../../../users/users.repository';
import { EmailAdapter } from '../../../../adapters/email-adapter/email.adapter';
import { Result, ResultCode } from '../../../../helpers/contract';

export class ResendEmailCommand {
  constructor(public inputData: InputEmailForResendCodeDTO) {}
}

@CommandHandler(ResendEmailCommand)
export class ResendEmailUseCases
  implements ICommandHandler<ResendEmailCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailAdapter: EmailAdapter,
  ) {}

  async execute(command: ResendEmailCommand): Promise<Result<boolean>> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      command.inputData.email,
    );
    await this.usersRepository.setNewConfirmationCode(user);
    const updatedUser = await this.usersRepository.findUserByLoginOrEmail(
      command.inputData.email,
    );
    await this.emailAdapter.sendEmail(
      updatedUser.accountData.email,
      updatedUser.emailConfirmation.confirmationCode,
    );
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
