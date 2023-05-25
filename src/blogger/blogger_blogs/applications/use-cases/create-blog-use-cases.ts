import { BloggerBlogInfoDTO, InputBlogDTO } from '../blogger-blogs.dto';
import { BloggerBlogsRepository } from '../../blogger-blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result, ResultCode } from '../../../../helpers/contract';
import { Blogs } from '../blogger-blogs.entity';
import { Users } from '../../../../super_admin/sa_users/applications/users.entity';
import { v4 as uuidv4 } from 'uuid';
import { AuthRepository } from '../../../../public/auth/auth.repository';

export class CreateBlogCommand {
  constructor(public inputData: InputBlogDTO, public currentUserId: string) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCases implements ICommandHandler<CreateBlogCommand> {
  constructor(
    private bloggerBlogsRepository: BloggerBlogsRepository,
    private authRepository: AuthRepository,
  ) {}

  async execute(
    command: CreateBlogCommand,
  ): Promise<Result<BloggerBlogInfoDTO>> {
    const user: Users = await this.authRepository.findUserById(
      command.currentUserId,
    );
    const newBlog: Blogs = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      name: command.inputData.name,
      description: command.inputData.description,
      websiteUrl: command.inputData.websiteUrl,
      isMembership: false,
      owner: command.currentUserId,
      ownerLogin: user.login,
      blogIsBanned: false,
      blogBanDate: null,
    };
    await this.bloggerBlogsRepository.createBlog(newBlog);
    const blogView = new BloggerBlogInfoDTO(
      newBlog.id,
      newBlog.name,
      newBlog.description,
      newBlog.websiteUrl,
      newBlog.createdAt,
      newBlog.isMembership,
    );
    return new Result<BloggerBlogInfoDTO>(ResultCode.Success, blogView, null);
  }
}
