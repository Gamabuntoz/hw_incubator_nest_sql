import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../../helpers/constants';
import { AuthRepository } from '../../public/auth/auth.repository';
import { User } from '../../super_admin/sa_users/applications/users.schema';

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
    const user: User = await this.authRepository.findUserById(payload.userId);
    if (!user) throw new UnauthorizedException();
    return { id: payload.userId };
  }
}
