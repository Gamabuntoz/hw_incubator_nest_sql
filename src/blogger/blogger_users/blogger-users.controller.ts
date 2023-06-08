import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  InputBanUserForBlogDTO,
  QueryBannedUsersForBlogDTO,
} from './applications/blogger-users.dto';
import { BloggerUsersService } from './blogger-users.service';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAccessAuthGuard } from 'src/security/guards/jwt-access-auth.guard';
import { Result, ResultCode } from 'src/helpers/contract';
import { CurrentUserId } from '../../helpers/decorators/current-user.param.decorator';
import { BanUserForBlogCommand } from './applications/use-cases/ban-user-for-blog-use-cases';

@Controller('blogger/users')
export class BloggerUsersController {
  constructor(
    private commandBus: CommandBus,
    protected bloggerUsersService: BloggerUsersService,
  ) {}

  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('blog/:blogId')
  async findAllBlogs(
    @Query() query: QueryBannedUsersForBlogDTO,
    @Param('blogId') blogId: string,
    @CurrentUserId() currentUserId: string,
  ) {
    const result = await this.bloggerUsersService.findAllBannedUsers(
      query,
      blogId,
      currentUserId,
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':userId/ban')
  async updatePostByBlogId(
    @Param('userId') userId: string,
    @Body() inputData: InputBanUserForBlogDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.commandBus.execute(
      new BanUserForBlogCommand(userId, inputData, currentUserId),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }
}
