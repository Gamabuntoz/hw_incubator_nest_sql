import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result, ResultCode } from '../../../../helpers/contract';
import { SABlogsRepository } from '../../sa-blogs.repository';
import { Blogs } from '../../../../blogger/blogger_blogs/applications/blogger-blogs.entity';
import { BlogBanDTO } from '../sa-blogs.dto';

export class BanBlogByIdCommand {
  constructor(public blogId: string, public blogBanState: BlogBanDTO) {}
}

@CommandHandler(BanBlogByIdCommand)
export class BanBlogByIdUseCases
  implements ICommandHandler<BanBlogByIdCommand>
{
  constructor(private saBlogsRepository: SABlogsRepository) {}

  async execute(command: BanBlogByIdCommand): Promise<Result<boolean>> {
    const blog: Blogs = await this.saBlogsRepository.findBlogById(
      command.blogId,
    );
    if (!blog)
      return new Result<boolean>(ResultCode.NotFound, false, 'blog not found');
    if (blog.blogIsBanned === command.blogBanState.isBanned)
      return new Result<boolean>(
        ResultCode.Success,
        true,
        'blog is already have input ban status',
      );
    await this.saBlogsRepository.banBlogById(
      command.blogId,
      command.blogBanState.isBanned,
    );
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
