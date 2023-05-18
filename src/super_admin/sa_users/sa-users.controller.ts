import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SAUsersService } from './sa-users.service';
import { InputBanUserDTO, QueryUsersDTO } from './applications/sa-users.dto';
import { BasicAuthGuard } from '../../security/guards/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteUserCommand } from './applications/use-cases/delete-user-use-cases';
import { Result, ResultCode } from '../../helpers/contract';
import { InputRegistrationDTO } from '../../public/auth/applications/auth.dto';
import { CreateUserByAdminCommand } from './applications/use-cases/create-user-by-admin-use-case';
import { BanUserCommand } from './applications/use-cases/ban-user-use-cases';

@Controller('sa/users')
export class SAUsersController {
  constructor(
    protected saUserService: SAUsersService,
    private commandBus: CommandBus,
  ) {}
  //
  // Query controller
  //
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async getUsers(@Query() query: QueryUsersDTO) {
    const result = await this.saUserService.findUsers(query);
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }
  //
  // Command controller
  //
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createUser(@Body() inputData: InputRegistrationDTO) {
    const result = await this.commandBus.execute(
      new CreateUserByAdminCommand(inputData),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':userId/ban')
  async banUser(
    @Param('userId') userId: string,
    @Body() inputData: InputBanUserDTO,
  ) {
    const result = await this.commandBus.execute(
      new BanUserCommand(userId, inputData),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':userId')
  async deleteUser(@Param('userId') userId: string) {
    const result = await this.commandBus.execute(new DeleteUserCommand(userId));
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }
}
