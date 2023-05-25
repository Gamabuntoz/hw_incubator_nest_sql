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
import { BlogBanDTO, QueryBlogsDTO } from './applications/sa-blogs.dto';
import { SABlogsService } from './sa-blogs.service';
import { Result, ResultCode } from '../../helpers/contract';
import { BasicAuthGuard } from '../../security/guards/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { BindBlogWithUserCommand } from './applications/use-cases/bind-blog-with-user-use-cases';
import { BanBlogByIdCommand } from './applications/use-cases/ban-blog-by-id-use-cases';

@Controller('sa/blogs')
export class SABlogsController {
  constructor(
    protected saBlogsService: SABlogsService,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAllBlogs(@Query() query: QueryBlogsDTO) {
    const result = await this.saBlogsService.findAllBlogs(query);
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Put(':blogId/bind-with-user/:userId')
  async findBlogById(
    @Param('blogId') blogId: string,
    @Param('userId') userId: string,
  ) {
    const result = await this.commandBus.execute(
      new BindBlogWithUserCommand(blogId, userId),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':blogId/ban')
  async banBlogById(
    @Param('blogId') blogId: string,
    @Body() blogBanState: BlogBanDTO,
  ) {
    const result = await this.commandBus.execute(
      new BanBlogByIdCommand(blogId, blogBanState),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }
}
