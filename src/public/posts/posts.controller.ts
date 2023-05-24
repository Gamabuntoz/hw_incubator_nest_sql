import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { QueryPostsDTO } from './applications/posts.dto';
import { CurrentUserId } from '../../helpers/decorators/current-user.param.decorator';
import { OptionalJwtAuthGuard } from '../../security/guards/optional-jwt-auth.guard';
import { TryObjectIdPipe } from '../../helpers/decorators/try-object-id.param.decorator';
import { Types } from 'mongoose';
import { CommandBus } from '@nestjs/cqrs';

import { Result, ResultCode } from '../../helpers/contract';

@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    protected postsService: PostsService,
  ) {}

  //
  // Query controller
  //

  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAllPosts(
    @Query() query: QueryPostsDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.postsService.findAllPosts(query, currentUserId);
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findPostById(
    @Param('id', new TryObjectIdPipe()) id: string,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.postsService.findPostById(id, currentUserId);
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }
}
