import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { InputLikeStatusDTO, QueryPostsDTO } from './applications/posts.dto';
import { CurrentUserId } from '../../helpers/decorators/current-user.param.decorator';
import { OptionalJwtAuthGuard } from '../../security/guards/optional-jwt-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { Result, ResultCode } from '../../helpers/contract';
import { JwtAccessAuthGuard } from '../../security/guards/jwt-access-auth.guard';
import { InputCommentDTO } from '../comments/applications/comments.dto';
import { CreateCommentWithPostIdCommand } from '../comments/applications/use-cases/create-comment-whith-post-id-use-cases';
import { UpdatePostLikeStatusCommand } from './applications/use-cases/update-post-like-status-use-cases';

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
  @Get(':postId')
  async findPostById(
    @Param('postId') postId: string,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.postsService.findPostById(postId, currentUserId);
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':postId/comments')
  async findCommentsByPostId(
    @Param('postId') postId: string,
    @Query() query: QueryPostsDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.postsService.findCommentsByPostId(
      postId,
      query,
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
  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post(':postId/comments')
  async createCommentByPostId(
    @Param('postId') postId: string,
    @Body() inputData: InputCommentDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.commandBus.execute(
      new CreateCommentWithPostIdCommand(
        postId,
        inputData.content,
        currentUserId,
      ),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':postId/like-status')
  async updateLikeStatusForPostById(
    @Param('postId') postId: string,
    @Body() inputData: InputLikeStatusDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.commandBus.execute(
      new UpdatePostLikeStatusCommand(postId, inputData, currentUserId),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }
}
