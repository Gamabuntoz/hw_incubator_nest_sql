import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InputRegistrationDTO } from '../auth.dto';
import { EmailAdapter } from '../../../../adapters/email-adapter/email.adapter';
import { UsersRepository } from '../../../users/users.repository';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { UserInfoDTO } from '../../../users/applications/users.dto';
import { Result, ResultCode } from '../../../../helpers/contract';

export class RegistrationUserCommand {
  constructor(public inputData: InputRegistrationDTO) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCases
  implements ICommandHandler<RegistrationUserCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailAdapter: EmailAdapter,
  ) {}

  async execute(command: RegistrationUserCommand): Promise<Result<boolean>> {
    await this.createUser(command.inputData);
    const user = await this.usersRepository.findUserByLoginOrEmail(
      command.inputData.login,
    );
    await this.emailAdapter.sendEmail(
      user.accountData.email,
      user.emailConfirmation.confirmationCode,
    );
    return new Result<boolean>(ResultCode.Success, true, null);
  }

  private async _generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }

  private async createUser(
    inputData: InputRegistrationDTO,
  ): Promise<UserInfoDTO> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(
      inputData.password,
      passwordSalt,
    );
    const newUser = {
      _id: new Types.ObjectId(),
      accountData: {
        login: inputData.login,
        email: inputData.email,
        passwordHash: passwordHash,
        createdAt: new Date().toISOString(),
      },
      emailConfirmation: {
        confirmationCode: uuidv4(),
        isConfirmed: false,
        expirationDate: add(new Date(), {
          hours: 1,
        }),
      },
      passwordRecovery: {
        code: 'string',
        expirationDate: new Date(),
      },
      banInformation: {
        isBanned: false,
        banReason: 'not banned',
        banDate: new Date(),
      },
    };
    await this.usersRepository.createUser(newUser);
    return new UserInfoDTO(
      newUser._id.toString(),
      newUser.accountData.login,
      newUser.accountData.email,
      newUser.accountData.createdAt,
    );
  }
}
