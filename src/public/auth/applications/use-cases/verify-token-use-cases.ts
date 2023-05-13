import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { jwtConstants } from '../../../../helpers/constants';
import { JwtService } from '@nestjs/jwt';

export class VerifyTokenCommand {
  constructor(public token: string) {}
}

@CommandHandler(VerifyTokenCommand)
export class VerifyTokenUseCases
  implements ICommandHandler<VerifyTokenCommand>
{
  constructor(private jwtService: JwtService) {}

  async execute(command: VerifyTokenCommand) {
    return this.jwtService.verify(command.token, {
      secret: jwtConstants.secretKey,
    });
  }
}
