import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/users.repository';
import { InputConfirmationCodeDTO } from '../auth.dto';
import { Result, ResultCode } from '../../../../helpers/contract';

export class ConfirmEmailCommand {
  constructor(public inputData: InputConfirmationCodeDTO) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCases
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: ConfirmEmailCommand): Promise<Result<boolean>> {
    const user = await this.usersRepository.findUserByConfirmationCode(
      command.inputData.code,
    );
    await this.usersRepository.updateConfirmation(user._id.toString());
    return new Result(ResultCode.Success, true, null);
  }
}
