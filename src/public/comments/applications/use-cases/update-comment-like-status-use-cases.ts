import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../comments.repository';
import { InputLikeStatusDTO } from '../../../posts/applications/posts.dto';
import { Result, ResultCode } from '../../../../helpers/contract';
import { v4 as uuidv4 } from 'uuid';

export class UpdateCommentLikeStatusCommand {
  constructor(
    public id: string,
    public inputData: InputLikeStatusDTO,
    public currentUserId: string,
  ) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusUseCases
  implements ICommandHandler<UpdateCommentLikeStatusCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute(
    command: UpdateCommentLikeStatusCommand,
  ): Promise<Result<boolean>> {
    const updateLike = await this.updateCommentLike(
      command.id,
      command.inputData.likeStatus,
      command.currentUserId,
    );
    if (updateLike) return new Result<boolean>(ResultCode.Success, true, null);
    const setLike = await this.setCommentLike(
      command.id,
      command.inputData.likeStatus,
      command.currentUserId,
    );
    if (!setLike)
      return new Result<boolean>(
        ResultCode.NotFound,
        null,
        'Comment not found',
      );
    return new Result<boolean>(ResultCode.Success, true, null);
  }

  private async updateCommentLike(
    commentId: string,
    likeStatus: string,
    userId: string,
  ): Promise<boolean> {
    const comment = await this.commentsRepository.findCommentById(commentId);
    if (!comment) return false;
    return await this.commentsRepository.updateCommentLike(
      commentId.toString(),
      likeStatus,
      userId,
    );
  }

  private async setCommentLike(
    commentId: string,
    likeStatus: string,
    userId: string,
  ): Promise<boolean> {
    const comment = await this.commentsRepository.findCommentById(commentId);
    if (!comment) return false;
    const commentLike = {
      id: uuidv4(),
      user: userId,
      comment: commentId,
      status: likeStatus,
      addedAt: new Date().toISOString(),
    };
    await this.commentsRepository.setCommentLike(commentLike);
    return true;
  }
}
