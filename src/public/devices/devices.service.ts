import { Injectable } from '@nestjs/common';
import { DevicesRepository } from './devices.repository';
import { AuthDeviceDTO } from './applications/devices.dto';
import { Result, ResultCode } from '../../helpers/contract';

@Injectable()
export class DevicesService {
  constructor(protected devicesRepository: DevicesRepository) {}

  async findAllUserDevices(
    currentUserId: string,
  ): Promise<Result<AuthDeviceDTO[]>> {
    const allUserDevices = await this.devicesRepository.findAllUserDevices(
      currentUserId,
    );
    const allDevicesView = allUserDevices.map(
      (d) =>
        new AuthDeviceDTO(
          d.ipAddress,
          d.deviceName,
          new Date(+d.issueAt).toISOString(),
          d.id,
        ),
    );
    return new Result<AuthDeviceDTO[]>(
      ResultCode.Success,
      allDevicesView,
      null,
    );
  }
}
