import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SAUsersRepository } from '../../sa-users.repository';
import { Result, ResultCode } from '../../../../helpers/contract';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCases implements ICommandHandler<DeleteUserCommand> {
  constructor(protected saUsersRepository: SAUsersRepository) {}

  async execute(command: DeleteUserCommand): Promise<Result<boolean>> {
    const deletedUser = await this.saUsersRepository.deleteUser(command.userId);
    if (!deletedUser)
      return new Result<boolean>(ResultCode.NotFound, false, 'User not found');
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
