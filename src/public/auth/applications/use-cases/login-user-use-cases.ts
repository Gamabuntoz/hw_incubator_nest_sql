import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../../devices/devices.repository';
import { Devices } from '../../../devices/applications/devices.entity';
import { v4 as uuidv4 } from 'uuid';
import { jwtConstants } from '../../../../helpers/constants';
import { InputLoginDTO } from '../auth.dto';
import { AuthRepository } from '../../auth.repository';
import { AuthService } from '../../auth.service';
import { Result, ResultCode } from '../../../../helpers/contract';
import { Users } from '../../../../super_admin/sa_users/applications/users.entity';

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
    private authRepository: AuthRepository,
    private devicesRepository: DevicesRepository,
    private authService: AuthService,
  ) {}

  async execute(command: LoginUserCommand): Promise<Result<object>> {
    const user: Users = await this.authRepository.findUserByLoginOrEmail(
      command.inputData.loginOrEmail,
    );
    if (!user)
      return new Result<object>(ResultCode.NotFound, null, 'User not found');
    if (user.userIsBanned)
      return new Result<object>(
        ResultCode.Unauthorized,
        null,
        'User is banned',
      );
    const device: Devices = {
      id: uuidv4(),
      ipAddress: command.ip,
      deviceName: command.deviceName,
      issueAt: new Date().getTime(),
      expiresAt: new Date().getTime() + jwtConstants.expirationRefreshToken,
      user: user.id,
    };
    await this.devicesRepository.insertDeviceInfo(device);
    const newPairTokens = await this.authService.createNewPairTokens(
      device.user,
      device.id,
      device.issueAt,
    );
    return new Result<object>(ResultCode.Success, newPairTokens, null);
  }
}
