import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../../../users/users.repository';
import { AuthService } from '../../auth.service';
import { InputNewPassDTO } from '../auth.dto';
import { Result, ResultCode } from '../../../../helpers/contract';

export class NewPasswordCommand {
  constructor(public inputData: InputNewPassDTO) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCases
  implements ICommandHandler<NewPasswordCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private authService: AuthService,
  ) {}

  async execute(command: NewPasswordCommand): Promise<Result<boolean>> {
    const user = await this.usersRepository.findUserByRecoveryCode(
      command.inputData.recoveryCode,
    );
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this.authService._generateHash(
      command.inputData.newPassword,
      passwordSalt,
    );
    await this.usersRepository.updatePassword(
      user._id.toString(),
      passwordHash,
    );
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
