import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CurrentUserId } from '../../helpers/decorators/current-user.param.decorator';
import { RefreshTokenPayload } from '../../helpers/decorators/get-refresh-token-payload.param.decorator';
import { RefreshPayloadDTO } from './applications/devices.dto';
import { JwtRefreshAuthGuard } from '../../security/guards/jwt-refresh-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteDeviceSessionCommand } from './applications/use-cases/delete-device-session-use-cases';
import { DeleteAllDeviceSessionsCommand } from './applications/use-cases/delete-all-device-sessions-use-cases';
import { Result, ResultCode } from '../../helpers/contract';

@Controller('security/devices')
export class DevicesController {
  constructor(
    private readonly devicesService: DevicesService,
    private commandBus: CommandBus,
  ) {}
  //
  //
  // Query controller
  //
  //
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshAuthGuard)
  @Get()
  async findAllUserDevices(@CurrentUserId() currentUserId) {
    const result = await this.devicesService.findAllUserDevices(currentUserId);
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }
  //
  //
  // Command controller
  //
  //
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshAuthGuard)
  @Delete()
  async deleteAllDevicesExceptCurrent(
    @RefreshTokenPayload() tokenPayload: RefreshPayloadDTO,
  ) {
    const result = await this.commandBus.execute(
      new DeleteAllDeviceSessionsCommand(tokenPayload),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshAuthGuard)
  @Delete(':id')
  async deleteDevicesById(
    @Param('id') id: string,
    @RefreshTokenPayload() tokenPayload: RefreshPayloadDTO,
  ) {
    const result = await this.commandBus.execute(
      new DeleteDeviceSessionCommand(id, tokenPayload),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }
}
