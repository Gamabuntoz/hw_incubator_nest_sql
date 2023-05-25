import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryPostsDTO } from '../posts/applications/posts.dto';
import { QueryBlogsDTO } from './applications/blogs.dto';
import { OptionalJwtAuthGuard } from '../../security/guards/optional-jwt-auth.guard';
import { CurrentUserId } from '../../helpers/decorators/current-user.param.decorator';
import { BlogsService } from './blogs.service';
import { Result, ResultCode } from '../../helpers/contract';

@Controller('blogs')
export class BlogsController {
  constructor(protected blogsService: BlogsService) {}
  //
  //
  // Query controller
  //
  //
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':blogId/posts')
  async findAllPostsByBlogId(
    @Param('blogId') blogId: string,
    @Query() query: QueryPostsDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.blogsService.findAllPostsByBlogId(
      blogId,
      query,
      currentUserId,
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAllBlogs(@Query() query: QueryBlogsDTO) {
    const result = await this.blogsService.findAllBlogs(query);
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @HttpCode(HttpStatus.OK)
  @Get(':blogId')
  async findBlogById(@Param('blogId') blogId: string) {
    const result = await this.blogsService.findBlogById(blogId);
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }
}
