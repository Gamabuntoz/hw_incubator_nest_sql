import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Ip,
  Headers,
  Res,
} from '@nestjs/common';
import {
  InputConfirmationCodeDTO,
  InputEmailForPasswordRecoveryDTO,
  InputEmailForResendCodeDTO,
  InputLoginDTO,
  InputNewPassDTO,
  InputRegistrationDTO,
} from './applications/auth.dto';
import { AuthService } from './auth.service';
import { JwtAccessAuthGuard } from '../../security/guards/jwt-access-auth.guard';
import { CurrentUserId } from '../../helpers/decorators/current-user.param.decorator';
import { Response } from 'express';
import { RefreshTokenPayload } from '../../helpers/decorators/get-refresh-token-payload.param.decorator';
import { RefreshPayloadDTO } from '../devices/applications/devices.dto';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { LocalAuthGuard } from '../../security/guards/local-auth.guard';
import { JwtRefreshAuthGuard } from '../../security/guards/jwt-refresh-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { LogoutUserCommand } from './applications/use-cases/logout-user-use-cases';
import { ResendEmailCommand } from './applications/use-cases/resend-email-for-registration-use-cases';
import { RegistrationUserCommand } from './applications/use-cases/registration-user-use-cases';
import { ConfirmEmailCommand } from './applications/use-cases/confirm-email-for-registration-use-cases';
import { RefreshTokensCommand } from './applications/use-cases/refresh-user-tokens-user-use-cases';
import { LoginUserCommand } from './applications/use-cases/login-user-use-cases';
import { NewPasswordCommand } from './applications/use-cases/new-user-password-use-cases';
import { PasswordRecoveryCommand } from './applications/use-cases/recovery-user-password-use-cases';
import { Result, ResultCode } from '../../helpers/contract';

//@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    protected authService: AuthService,
    private commandBus: CommandBus,
  ) {}
  //
  // Query controller
  //
  @SkipThrottle()
  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('me')
  async getInfoAboutCurrentUser(@CurrentUserId() currentUserId) {
    const result = await this.authService.getInfoAboutCurrentUser(
      currentUserId,
    );
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
  @Post('password-recovery')
  async passwordRecovery(@Body() inputData: InputEmailForPasswordRecoveryDTO) {
    const result = await this.commandBus.execute(
      new PasswordRecoveryCommand(inputData),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('new-password')
  async newPassword(@Body() inputData: InputNewPassDTO) {
    const result = await this.commandBus.execute(
      new NewPasswordCommand(inputData),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body() inputData: InputLoginDTO,
    @Ip() ip: string,
    @Headers('user-agent') deviceName: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.commandBus.execute(
      new LoginUserCommand(inputData, ip, deviceName),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    response.cookie('refreshToken', result.data.refreshToken, {
      secure: true,
      httpOnly: true,
    });
    return { accessToken: result.data.accessToken };
  }

  @SkipThrottle()
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshTokens(
    @RefreshTokenPayload() tokenPayload: RefreshPayloadDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.commandBus.execute(
      new RefreshTokensCommand(tokenPayload),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    response.cookie('refreshToken', result.data.refreshToken, {
      secure: true,
      httpOnly: true,
    });
    return { accessToken: result.data.accessToken };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  async confirmEmail(@Body() inputData: InputConfirmationCodeDTO) {
    const result = await this.commandBus.execute(
      new ConfirmEmailCommand(inputData),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async registration(@Body() inputData: InputRegistrationDTO) {
    const result = await this.commandBus.execute(
      new RegistrationUserCommand(inputData),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-email-resending')
  async resendEmail(@Body() inputData: InputEmailForResendCodeDTO) {
    const result = await this.commandBus.execute(
      new ResendEmailCommand(inputData),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }
  @SkipThrottle()
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@RefreshTokenPayload() tokenPayload: RefreshPayloadDTO) {
    const result = await this.commandBus.execute(
      new LogoutUserCommand(tokenPayload),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }
}
