import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../../helpers/constants';
import { UsersRepository } from '../../public/users/users.repository';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy) {
  constructor(protected usersRepository: UsersRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secretKey,
    });
  }
  async validate(payload: any) {
    const user = await this.usersRepository.findUserById(payload.userId);
    if (!user) throw new UnauthorizedException();
    return { id: payload.userId };
  }
}
