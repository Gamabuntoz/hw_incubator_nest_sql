import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../devices.repository';
import { RefreshPayloadDTO } from '../devices.dto';
import { Result, ResultCode } from '../../../../helpers/contract';

export class DeleteDeviceSessionCommand {
  constructor(public id: string, public tokenPayload: RefreshPayloadDTO) {}
}

@CommandHandler(DeleteDeviceSessionCommand)
export class DeleteDeviceSessionUseCases
  implements ICommandHandler<DeleteDeviceSessionCommand>
{
  constructor(private devicesRepository: DevicesRepository) {}

  async execute(command: DeleteDeviceSessionCommand): Promise<Result<boolean>> {
    const device = await this.devicesRepository.findDeviceByDeviceId(
      command.id,
    );
    if (!device)
      return new Result<boolean>(
        ResultCode.NotFound,
        null,
        'Device info not found',
      );
    if (device.userId !== command.tokenPayload.userId)
      return new Result<boolean>(
        ResultCode.Forbidden,
        null,
        'Access is denied',
      );
    await this.devicesRepository.deleteDeviceById(command.id.toString());
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
