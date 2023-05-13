import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../../devices/devices.repository';
import { Device } from '../../../devices/applications/devices.schema';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { jwtConstants } from '../../../../helpers/constants';
import { InputLoginDTO } from '../auth.dto';
import { UsersRepository } from '../../../users/users.repository';
import { AuthService } from '../../auth.service';
import { Result, ResultCode } from '../../../../helpers/contract';
import { User } from '../../../../super_admin/sa_users/applications/users.schema';

export class LoginUserCommand {
  constructor(
    public inputData: InputLoginDTO,
    public ip: string,
    public deviceName: string,
  ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCases implements ICommandHandler<LoginUserCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private devicesRepository: DevicesRepository,
    private authService: AuthService,
  ) {}

  async execute(command: LoginUserCommand): Promise<Result<object>> {
    const user: User = await this.usersRepository.findUserByLoginOrEmail(
      command.inputData.loginOrEmail,
    );
    if (!user)
      return new Result<object>(ResultCode.NotFound, null, 'User not found');
    if (user.banInformation.isBanned)
      return new Result<object>(
        ResultCode.Unauthorized,
        null,
        'User is banned',
      );
    const device: Device = {
      _id: new Types.ObjectId(),
      ipAddress: command.ip,
      deviceName: command.deviceName,
      deviceId: uuidv4(),
      issueAt: new Date().getTime(),
      expiresAt: new Date().getTime() + jwtConstants.expirationRefreshToken,
      userId: user._id.toString(),
    };
    await this.devicesRepository.insertDeviceInfo(device);
    const newPairTokens = await this.authService.createNewPairTokens(
      device.userId,
      device.deviceId,
      device.issueAt,
    );
    return new Result<object>(ResultCode.Success, newPairTokens, null);
  }
}
