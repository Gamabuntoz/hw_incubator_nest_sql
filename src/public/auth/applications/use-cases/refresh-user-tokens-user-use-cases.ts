import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../../devices/devices.repository';
import { RefreshPayloadDTO } from '../../../devices/applications/devices.dto';
import { AuthService } from '../../auth.service';
import { Result, ResultCode } from '../../../../helpers/contract';

export class RefreshTokensCommand {
  constructor(public tokenPayload: RefreshPayloadDTO) {}
}

@CommandHandler(RefreshTokensCommand)
export class RefreshTokensUseCases
  implements ICommandHandler<RefreshTokensCommand>
{
  constructor(
    private devicesRepository: DevicesRepository,
    private authService: AuthService,
  ) {}

  async execute(command: RefreshTokensCommand): Promise<Result<object>> {
    const issueAt = new Date().getTime();
    await this.devicesRepository.updateDeviceInfo(
      command.tokenPayload.issueAt,
      command.tokenPayload.userId,
      issueAt,
    );
    const newPairTokens = await this.authService.createNewPairTokens(
      command.tokenPayload.userId,
      command.tokenPayload.deviceId,
      issueAt,
    );
    return new Result<object>(ResultCode.Success, newPairTokens, null);
  }
}
