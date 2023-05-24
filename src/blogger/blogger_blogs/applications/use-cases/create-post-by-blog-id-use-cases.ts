import {
  InputPostDTO,
  PostInfoDTO,
} from '../../../../public/posts/applications/posts.dto';
import { PostsRepository } from '../../../../public/posts/posts.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result, ResultCode } from '../../../../helpers/contract';
import { Blogs } from '../blogger-blogs.entity';
import { BloggerBlogsRepository } from '../../blogger-blogs.repository';
import { v4 as uuidv4 } from 'uuid';

export class CreatePostWithBlogIdCommand {
  constructor(
    public blogId: string,
    public inputData: InputPostDTO,
    public currentUserId: string,
  ) {}
}

@CommandHandler(CreatePostWithBlogIdCommand)
export class CreatePostWithBlogIdUseCases
  implements ICommandHandler<CreatePostWithBlogIdCommand>
{
  constructor(
    protected bloggerBlogsRepository: BloggerBlogsRepository,
    protected postsRepository: PostsRepository,
  ) {}

  async execute(
    command: CreatePostWithBlogIdCommand,
  ): Promise<Result<PostInfoDTO>> {
    const blogById: Blogs = await this.bloggerBlogsRepository.findBlogById(
      command.blogId,
    );
    if (!blogById)
      return new Result<PostInfoDTO>(
        ResultCode.NotFound,
        null,
        'Blog not found',
      );
    if (blogById.owner !== command.currentUserId)
      return new Result<PostInfoDTO>(
        ResultCode.Forbidden,
        null,
        'Access denied',
      );
    const newPost = {
      id: uuidv4(),
      title: command.inputData.title,
      shortDescription: command.inputData.shortDescription,
      content: command.inputData.content,
      blogId: blogById.id,
      blogName: blogById.name,
      createdAt: new Date().toISOString(),
      likeCount: 0,
      dislikeCount: 0,
    };
    await this.postsRepository.createPost(newPost);
    const postView = new PostInfoDTO(
      newPost.id,
      newPost.title,
      newPost.shortDescription,
      newPost.content,
      newPost.blogId,
      newPost.blogName,
      newPost.createdAt,
      {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    );
    return new Result<PostInfoDTO>(ResultCode.Success, postView, null);
  }
}
