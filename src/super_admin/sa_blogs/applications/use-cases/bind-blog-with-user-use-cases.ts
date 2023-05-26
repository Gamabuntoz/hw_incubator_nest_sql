import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result, ResultCode } from '../../../../helpers/contract';
import { SABlogsRepository } from '../../sa-blogs.repository';
import { SAUsersRepository } from '../../../sa_users/sa-users.repository';

export class BindBlogWithUserCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserUseCases
  implements ICommandHandler<BindBlogWithUserCommand>
{
  constructor(
    private saBlogsRepository: SABlogsRepository,
    private saUsersRepository: SAUsersRepository,
  ) {}

  async execute(command: BindBlogWithUserCommand): Promise<Result<boolean>> {
    const blog = await this.saBlogsRepository.findBlogById(command.blogId);
    if (!blog)
      return new Result<boolean>(ResultCode.NotFound, false, 'blog not found');
    if (blog.ownerId)
      return new Result<boolean>(
        ResultCode.BadRequest,
        false,
        'blog is already has owner',
      );
    const user = await this.saUsersRepository.findUserById(command.userId);
    if (!user)
      return new Result<boolean>(
        ResultCode.NotFound,
        false,
        'user is not found',
      );
    await this.saBlogsRepository.bindBlogWithUser(
      command.blogId,
      command.userId,
      user.login,
    );
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
