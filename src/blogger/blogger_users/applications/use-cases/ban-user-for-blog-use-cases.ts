import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result, ResultCode } from '../../../../helpers/contract';
import { InputBanUserForBlogDTO } from '../blogger-users.dto';
import { BloggerBlogsRepository } from '../../../blogger_blogs/blogger-blogs.repository';
import { BloggerUsersRepository } from '../../blogger-users.repository';
import { SAUsersRepository } from '../../../../super_admin/sa_users/sa-users.repository';
import { v4 as uuidv4 } from 'uuid';
import { BanUserForBlog } from '../banned-users-for-blogs.entity';

export class BanUserForBlogCommand {
  constructor(
    public userId: string,
    public inputData: InputBanUserForBlogDTO,
    public currentUserId: string,
  ) {}
}

@CommandHandler(BanUserForBlogCommand)
export class BanUserForBlogUseCases
  implements ICommandHandler<BanUserForBlogCommand>
{
  constructor(
    protected bloggerBlogsRepository: BloggerBlogsRepository,
    protected bloggerUsersRepository: BloggerUsersRepository,
    protected usersRepository: SAUsersRepository,
  ) {}

  async execute(command: BanUserForBlogCommand): Promise<Result<boolean>> {
    const blog = await this.bloggerBlogsRepository.findBlogById(
      command.inputData.blogId,
    );
    if (!blog)
      return new Result<boolean>(ResultCode.NotFound, false, 'Blog not found');
    if (blog.ownerId !== command.currentUserId)
      return new Result<boolean>(ResultCode.Forbidden, false, 'Access denied');
    const bannedUser = await this.usersRepository.findUserById(command.userId);
    if (!bannedUser)
      return new Result<boolean>(ResultCode.NotFound, false, 'User not found');
    const updateBanStatus =
      await this.bloggerUsersRepository.updateBannedUserStatusForBlog(
        command.userId,
        command.inputData,
      );
    if (updateBanStatus)
      return new Result<boolean>(ResultCode.Success, true, null);
    const newBannedStatus: BanUserForBlog = {
      id: uuidv4(),
      blog: command.inputData.blogId,
      isBanned: command.inputData.isBanned,
      banDate: command.inputData.isBanned ? new Date().toISOString() : null,
      banReason: command.inputData.banReason
        ? command.inputData.banReason
        : null,
      user: command.userId,
      userLogin: bannedUser.accountData.login,
    };
    await this.bloggerUsersRepository.createBannedUserStatusForBlog(
      newBannedStatus,
    );
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
