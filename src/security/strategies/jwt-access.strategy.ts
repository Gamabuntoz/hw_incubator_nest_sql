import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../../helpers/constants';
import { AuthRepository } from '../../public/auth/auth.repository';
import { Users } from '../../super_admin/sa_users/applications/users.entity';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy) {
  constructor(protected authRepository: AuthRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secretKey,
    });
  }
  async validate(payload: any) {
    const user: Users = await this.authRepository.findUserById(payload.userId);
    if (!user) throw new UnauthorizedException();
    if (user.userIsBanned) throw new UnauthorizedException();
    return { id: payload.userId };
  }
}
