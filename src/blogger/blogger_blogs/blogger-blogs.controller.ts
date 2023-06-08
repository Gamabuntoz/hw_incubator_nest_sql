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
import {
  InputBlogDTO,
  QueryBlogsDTO,
  QueryCommentsDTO,
} from './applications/blogger-blogs.dto';
import { BloggerBlogsService } from './blogger-blogs.service';
import { CreateBlogCommand } from './applications/use-cases/create-blog-use-cases';
import { UpdateBlogCommand } from './applications/use-cases/update-blog-use-cases';
import { DeleteBlogCommand } from './applications/use-cases/delete-blog-use-cases';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAccessAuthGuard } from 'src/security/guards/jwt-access-auth.guard';
import { Result, ResultCode } from 'src/helpers/contract';
import { CurrentUserId } from '../../helpers/decorators/current-user.param.decorator';
import { InputPostDTO } from '../../public/posts/applications/posts.dto';
import { CreatePostWithBlogIdCommand } from './applications/use-cases/create-post-by-blog-id-use-cases';
import { UpdatePostCommand } from './applications/use-cases/update-post-by-blog-id-use-cases';
import { DeletePostCommand } from './applications/use-cases/delete-post-by-blog-id-use-cases';

@Controller('blogger/blogs')
export class BloggerBlogsController {
  constructor(
    private commandBus: CommandBus,
    protected bloggerBlogsService: BloggerBlogsService,
  ) {}

  //
  // Query controller
  //

  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAllBlogs(
    @Query() queryData: QueryBlogsDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.bloggerBlogsService.findAllBlogs(
      queryData,
      currentUserId,
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('comments')
  async findAllCommentForBlogger(
    @Query() queryData: QueryCommentsDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.bloggerBlogsService.findAllCommentForBlogger(
      queryData,
      currentUserId,
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  //
  // Command controller
  //

  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createBlog(
    @Body() inputData: InputBlogDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.commandBus.execute(
      new CreateBlogCommand(inputData, currentUserId),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':blogId')
  async updateBlog(
    @Param('blogId') blogId: string,
    @Body() inputData: InputBlogDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.commandBus.execute(
      new UpdateBlogCommand(blogId, inputData, currentUserId),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':blogId')
  async deleteBlog(
    @Param('blogId') blogId: string,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.commandBus.execute(
      new DeleteBlogCommand(blogId, currentUserId),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }
  //
  // post methods
  //
  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post(':blogId/posts')
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() inputData: InputPostDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.commandBus.execute(
      new CreatePostWithBlogIdCommand(blogId, inputData, currentUserId),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':blogId/posts/:postId')
  async updatePostByBlogId(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() inputData: InputPostDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.commandBus.execute(
      new UpdatePostCommand(blogId, postId, inputData, currentUserId),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':blogId/posts/:postId')
  async deletePostByBlogId(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.commandBus.execute(
      new DeletePostCommand(blogId, postId, currentUserId),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }
}
