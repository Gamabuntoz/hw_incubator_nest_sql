import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InputEmailForResendCodeDTO } from '../auth.dto';
import { AuthRepository } from '../../auth.repository';
import { EmailAdapter } from '../../../../adapters/email-adapter/email.adapter';
import { Result, ResultCode } from '../../../../helpers/contract';
import { Users } from '../../../../super_admin/sa_users/applications/users.entity';

export class ResendEmailCommand {
  constructor(public inputData: InputEmailForResendCodeDTO) {}
}

@CommandHandler(ResendEmailCommand)
export class ResendEmailUseCases
  implements ICommandHandler<ResendEmailCommand>
{
  constructor(
    private usersRepository: AuthRepository,
    private emailAdapter: EmailAdapter,
  ) {}

  async execute(command: ResendEmailCommand): Promise<Result<boolean>> {
    const user: Users = await this.usersRepository.findUserByLoginOrEmail(
      command.inputData.email,
    );
    await this.usersRepository.setNewConfirmationCode(user.id);
    const updatedUser = await this.usersRepository.findUserByLoginOrEmail(
      command.inputData.email,
    );
    await this.emailAdapter.sendEmail(
      updatedUser.email,
      updatedUser.emailConfirmationCode,
    );
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
