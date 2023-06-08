import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { CommentInfoDTO } from './applications/comments.dto';
import { CommentLikes } from './applications/comments-likes.entity';
import { Result, ResultCode } from '../../helpers/contract';
import { AuthRepository } from '../auth/auth.repository';
import { Users } from '../../super_admin/sa_users/applications/users.entity';

@Injectable()
export class CommentsService {
  constructor(
    protected commentsRepository: CommentsRepository,
    protected authRepository: AuthRepository,
  ) {}

  async findCommentById(
    id: string,
    userId?: string,
  ): Promise<Result<CommentInfoDTO>> {
    const comment = await this.commentsRepository.findCommentById(id);
    if (!comment)
      return new Result<CommentInfoDTO>(
        ResultCode.NotFound,
        null,
        'Comment not found',
      );
    const user: Users = await this.authRepository.findUserById(comment.userId);
    if (user.userIsBanned)
      return new Result<CommentInfoDTO>(
        ResultCode.NotFound,
        null,
        'Comment owner is banned',
      );
    const countBannedLikesOwner = await this.countBannedStatusOwner(id, 'Like');
    const countBannedDislikesOwner = await this.countBannedStatusOwner(
      id,
      'Dislike',
    );
    let likeStatusCurrentUser;
    if (userId) {
      likeStatusCurrentUser =
        await this.commentsRepository.findCommentLikeByCommentAndUserId(
          id,
          userId,
        );
    }
    const commentView = await this.createCommentViewInfo(
      comment,
      likeStatusCurrentUser,
      countBannedLikesOwner,
      countBannedDislikesOwner,
    );
    return new Result<CommentInfoDTO>(ResultCode.Success, commentView, null);
  }

  async countBannedStatusOwner(commentId: string, status: string) {
    return this.authRepository.countBannedUsersCommentLikeOwner(
      commentId,
      status,
    );
  }

  async createCommentViewInfo(
    comment,
    likeStatusCurrentUser?: CommentLikes,
    countBannedLikesOwner?: number,
    countBannedDislikesOwner?: number,
  ): Promise<CommentInfoDTO> {
    return new CommentInfoDTO(
      comment.id,
      comment.content,
      {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      comment.createdAt,
      {
        dislikesCount: countBannedDislikesOwner
          ? comment.dislikeCount - countBannedDislikesOwner
          : comment.dislikeCount,
        likesCount: countBannedLikesOwner
          ? comment.likeCount - countBannedLikesOwner
          : comment.likeCount,
        myStatus: likeStatusCurrentUser ? likeStatusCurrentUser.status : 'None',
      },
    );
  }
}
