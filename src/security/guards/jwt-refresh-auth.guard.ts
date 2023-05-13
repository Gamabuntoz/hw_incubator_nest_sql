import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../../helpers/constants';
import { DevicesRepository } from '../../public/devices/devices.repository';

@Injectable()
export class JwtRefreshAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    protected devicesRepository: DevicesRepository,
  ) {}
  public async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) throw new UnauthorizedException();
    let payload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        ignoreExpiration: false,
        secret: jwtConstants.secretKey,
      });
    } catch (e) {
      throw new UnauthorizedException();
    }
    if (!payload) throw new UnauthorizedException();
    const device = await this.devicesRepository.findDeviceByDateAndUserId(
      payload.issueAt,
      payload.userId,
    );
    if (!device) throw new UnauthorizedException();
    req.user = {
      id: payload.userId,
      deviceId: payload.deviceId,
      issueAt: payload.issueAt,
    };
    return true;
  }
}
