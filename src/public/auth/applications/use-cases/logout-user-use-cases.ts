import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../../devices/devices.repository';
import { RefreshPayloadDTO } from '../../../devices/applications/devices.dto';
import { Result, ResultCode } from '../../../../helpers/contract';

export class LogoutUserCommand {
  constructor(public tokenPayload: RefreshPayloadDTO) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCases implements ICommandHandler<LogoutUserCommand> {
  constructor(private devicesRepository: DevicesRepository) {}

  async execute(command: LogoutUserCommand): Promise<Result<boolean>> {
    const deletedDevice = await this.devicesRepository.deleteDevice(
      command.tokenPayload.issueAt,
      command.tokenPayload.userId,
    );
    if (!deletedDevice)
      return new Result<boolean>(
        ResultCode.NotFound,
        false,
        'Device not found',
      );
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
