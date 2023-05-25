import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result, ResultCode } from '../../../../helpers/contract';
import { InputBanUserForBlogDTO } from '../blogger-users.dto';
import { BloggerBlogsRepository } from '../../../blogger_blogs/blogger-blogs.repository';
import { BloggerUsersRepository } from '../../blogger-users.repository';
import { v4 as uuidv4 } from 'uuid';
import { BanUserForBlog } from '../banned-users-for-blogs.entity';
import { AuthRepository } from '../../../../public/auth/auth.repository';
import { Users } from '../../../../super_admin/sa_users/applications/users.entity';

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
    protected authRepository: AuthRepository,
  ) {}

  async execute(command: BanUserForBlogCommand): Promise<Result<boolean>> {
    const blog = await this.bloggerBlogsRepository.findBlogById(
      command.inputData.blogId,
    );
    if (!blog)
      return new Result<boolean>(ResultCode.NotFound, false, 'Blog not found');
    if (blog.ownerId !== command.currentUserId)
      return new Result<boolean>(ResultCode.Forbidden, false, 'Access denied');
    const bannedUser: Users = await this.authRepository.findUserById(
      command.userId,
    );
    if (!bannedUser)
      return new Result<boolean>(ResultCode.NotFound, false, 'User not found');
    const checkUserForBan = await this.bloggerUsersRepository.checkUserForBan(
      command.userId,
      command.inputData.blogId,
    );
    if (checkUserForBan) {
      await this.bloggerUsersRepository.updateBannedUserStatusForBlog(
        command.userId,
        command.inputData,
      );
      return new Result<boolean>(ResultCode.Success, true, null);
    }
    const newBannedStatus: BanUserForBlog = {
      id: uuidv4(),
      blog: command.inputData.blogId,
      isBanned: command.inputData.isBanned,
      createdAt: new Date().toISOString(),
      banDate: command.inputData.isBanned ? new Date().toISOString() : null,
      banReason: command.inputData.banReason
        ? command.inputData.banReason
        : null,
      user: command.userId,
      userLogin: bannedUser.login,
    };
    await this.bloggerUsersRepository.createBannedUserStatusForBlog(
      newBannedStatus,
    );
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
