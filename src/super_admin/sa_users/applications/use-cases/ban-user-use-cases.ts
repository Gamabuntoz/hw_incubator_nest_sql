import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SAUsersRepository } from '../../sa-users.repository';
import { Result, ResultCode } from '../../../../helpers/contract';
import { InputBanUserDTO } from '../sa-users.dto';

export class BanUserCommand {
  constructor(public userId: string, public inputData: InputBanUserDTO) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCases implements ICommandHandler<BanUserCommand> {
  constructor(protected saUsersRepository: SAUsersRepository) {}

  async execute(command: BanUserCommand): Promise<Result<boolean>> {
    const user = await this.saUsersRepository.findUserById(command.userId);
    if (!user)
      return new Result<boolean>(ResultCode.NotFound, false, 'User not found');
    await this.saUsersRepository.updateUserBanStatus(
      command.userId,
      command.inputData,
    );
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
