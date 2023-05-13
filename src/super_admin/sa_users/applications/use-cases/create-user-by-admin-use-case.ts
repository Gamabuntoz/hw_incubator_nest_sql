import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { SAUserInfoDTO } from '../sa-users.dto';
import { Result, ResultCode } from '../../../../helpers/contract';
import { SAUsersService } from '../../sa-users.service';
import { SAUsersRepository } from '../../sa-users.repository';
import { InputRegistrationDTO } from '../../../../public/auth/applications/auth.dto';
import { User } from '../users.schema';

export class CreateUserByAdminCommand {
  constructor(public inputData: InputRegistrationDTO) {}
}

@CommandHandler(CreateUserByAdminCommand)
export class CreateUserByAdminUseCases
  implements ICommandHandler<CreateUserByAdminCommand>
{
  constructor(
    private saUsersService: SAUsersService,
    private saUsersRepository: SAUsersRepository,
  ) {}

  async execute(
    command: CreateUserByAdminCommand,
  ): Promise<Result<SAUserInfoDTO>> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(
      command.inputData.password,
      passwordSalt,
    );
    const newUser: User = {
      _id: new Types.ObjectId(),
      accountData: {
        login: command.inputData.login,
        email: command.inputData.email,
        passwordHash: passwordHash,
        createdAt: new Date().toISOString(),
      },
      emailConfirmation: {
        confirmationCode: uuidv4(),
        isConfirmed: true,
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
        banReason: null,
        banDate: null,
      },
    };
    await this.saUsersRepository.createUser(newUser);
    const userView = new SAUserInfoDTO(
      newUser._id.toString(),
      newUser.accountData.login,
      newUser.accountData.email,
      newUser.accountData.createdAt,
      {
        isBanned: newUser.banInformation.isBanned,
        banDate: null,
        banReason: null,
      },
    );
    return new Result<SAUserInfoDTO>(ResultCode.Success, userView, null);
  }

  private async _generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }
}
