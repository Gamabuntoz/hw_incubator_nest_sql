import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../auth.repository';
import { InputConfirmationCodeDTO } from '../auth.dto';
import { Result, ResultCode } from '../../../../helpers/contract';
import { Users } from '../../../../super_admin/sa_users/applications/users.entity';

export class ConfirmEmailCommand {
  constructor(public inputData: InputConfirmationCodeDTO) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCases
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(private authRepository: AuthRepository) {}

  async execute(command: ConfirmEmailCommand): Promise<Result<boolean>> {
    const user: Users = await this.authRepository.findUserByConfirmationCode(
      command.inputData.code,
    );
    await this.authRepository.updateConfirmation(user.id);
    return new Result(ResultCode.Success, true, null);
  }
}
