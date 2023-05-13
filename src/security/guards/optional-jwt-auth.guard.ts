import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { jwtConstants } from '../../helpers/constants';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  public canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    req.user = { id: null };
    try {
      const [type, token] = req.headers.authorization.split(' ');
      if (type === 'Bearer') {
        const payload = this.jwtService.verify(token, {
          secret: jwtConstants.secretKey,
        });
        req.user.id = payload.userId;
      }
    } finally {
      return true;
    }
  }
}
