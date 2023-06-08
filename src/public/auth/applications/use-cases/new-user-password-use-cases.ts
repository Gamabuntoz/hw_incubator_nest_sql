import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from '../../auth.repository';
import { AuthService } from '../../auth.service';
import { InputNewPassDTO } from '../auth.dto';
import { Result, ResultCode } from '../../../../helpers/contract';
import { Users } from '../../../../super_admin/sa_users/applications/users.entity';

export class NewPasswordCommand {
  constructor(public inputData: InputNewPassDTO) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCases
  implements ICommandHandler<NewPasswordCommand>
{
  constructor(
    private authRepository: AuthRepository,
    private authService: AuthService,
  ) {}

  async execute(command: NewPasswordCommand): Promise<Result<boolean>> {
    const user: Users = await this.authRepository.findUserByRecoveryCode(
      command.inputData.recoveryCode,
    );
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this.authService._generateHash(
      command.inputData.newPassword,
      passwordSalt,
    );
    await this.authRepository.updatePassword(user.id, passwordHash);
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
