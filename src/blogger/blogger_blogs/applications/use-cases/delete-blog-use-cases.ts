import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Blogs } from '../blogger-blogs.entity';
import { BloggerBlogsRepository } from '../../blogger-blogs.repository';
import { Result, ResultCode } from '../../../../helpers/contract';

export class DeleteBlogCommand {
  constructor(public id: string, public currentUserId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCases implements ICommandHandler<DeleteBlogCommand> {
  constructor(protected bloggerBlogsRepository: BloggerBlogsRepository) {}

  async execute(command: DeleteBlogCommand): Promise<Result<boolean>> {
    const blog: Blogs = await this.bloggerBlogsRepository.findBlogById(
      command.id,
    );
    if (!blog)
      return new Result<boolean>(ResultCode.NotFound, false, 'Blog not found');
    if (blog.owner !== command.currentUserId)
      return new Result<boolean>(ResultCode.Forbidden, false, 'Access denied');
    await this.bloggerBlogsRepository.deleteBlog(command.id);
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
