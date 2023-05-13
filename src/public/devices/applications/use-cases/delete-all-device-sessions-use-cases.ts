import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../devices.repository';
import { RefreshPayloadDTO } from '../devices.dto';
import { Result, ResultCode } from '../../../../helpers/contract';

export class DeleteAllDeviceSessionsCommand {
  constructor(public tokenPayload: RefreshPayloadDTO) {}
}

@CommandHandler(DeleteAllDeviceSessionsCommand)
export class DeleteAllDeviceSessionsUseCases
  implements ICommandHandler<DeleteAllDeviceSessionsCommand>
{
  constructor(private devicesRepository: DevicesRepository) {}

  async execute(
    command: DeleteAllDeviceSessionsCommand,
  ): Promise<Result<boolean>> {
    await this.devicesRepository.deleteAllDevicesExceptCurrent(
      command.tokenPayload.issueAt,
      command.tokenPayload.userId,
    );
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
