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
import { TryObjectIdPipe } from '../../helpers/decorators/try-object-id.param.decorator';
import { BlogsService } from './blogs.service';
import { Types } from 'mongoose';
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
  @Get(':id/posts')
  async findAllPostsByBlogId(
    @Param('id', new TryObjectIdPipe()) id: string,
    @Query() query: QueryPostsDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.blogsService.findAllPostsByBlogId(
      id,
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
  @Get(':id')
  async findBlogById(@Param('id', new TryObjectIdPipe()) id: string) {
    const result = await this.blogsService.findBlogById(id);
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }
}
