import { PostsRepository } from '../../../posts/posts.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentInfoDTO } from '../comments.dto';
import { CommentsRepository } from '../../comments.repository';
import { Result, ResultCode } from '../../../../helpers/contract';
import { BloggerUsersRepository } from '../../../../blogger/blogger_users/blogger-users.repository';
import { AuthRepository } from '../../../auth/auth.repository';
import { v4 as uuidv4 } from 'uuid';
import { Users } from '../../../../super_admin/sa_users/applications/users.entity';
import { Comments } from '../comments.entity';

export class CreateCommentWithPostIdCommand {
  constructor(
    public postId: string,
    public content: string,
    public userId: string,
  ) {}
}

@CommandHandler(CreateCommentWithPostIdCommand)
export class CreateCommentWithPostIdUseCases
  implements ICommandHandler<CreateCommentWithPostIdCommand>
{
  constructor(
    protected authRepository: AuthRepository,
    protected postsRepository: PostsRepository,
    protected commentsRepository: CommentsRepository,
    protected bloggerUsersRepository: BloggerUsersRepository,
  ) {}

  async execute(
    command: CreateCommentWithPostIdCommand,
  ): Promise<Result<CommentInfoDTO>> {
    const user: Users = await this.authRepository.findUserById(command.userId);
    const postById = await this.postsRepository.findPostById(command.postId);
    if (!postById)
      return new Result<CommentInfoDTO>(
        ResultCode.NotFound,
        null,
        'Post not found',
      );
    const checkUserForBanForBlog =
      await this.bloggerUsersRepository.checkUserForBan(
        command.userId,
        postById.blogId,
      );
    if (checkUserForBanForBlog)
      return new Result<CommentInfoDTO>(
        ResultCode.Forbidden,
        null,
        'User banned for blog',
      );
    const newComment: Comments = {
      id: uuidv4(),
      post: command.postId,
      content: command.content,
      user: command.userId,
      userLogin: user.login,
      createdAt: new Date().toISOString(),
      likeCount: 0,
      dislikeCount: 0,
    };
    await this.commentsRepository.createComment(newComment);
    const commentView = new CommentInfoDTO(
      newComment.id,
      newComment.content,
      {
        userId: newComment.user,
        userLogin: newComment.userLogin,
      },
      newComment.createdAt,
      {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: 'None',
      },
    );
    return new Result<CommentInfoDTO>(ResultCode.Success, commentView, null);
  }
}
