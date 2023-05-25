import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { PostInfoDTO, QueryPostsDTO } from './applications/posts.dto';
import { Posts } from './applications/posts.entity';
import { PostLike } from './applications/posts-likes.schema';
import { Paginated } from '../../helpers/paginated';
import { Result, ResultCode } from '../../helpers/contract';
import { BloggerBlogsRepository } from '../../blogger/blogger_blogs/blogger-blogs.repository';
import { Blogs } from '../../blogger/blogger_blogs/applications/blogger-blogs.entity';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected bloggerBlogsRepository: BloggerBlogsRepository,
  ) {}

  async findAllPosts(
    queryData: QueryPostsDTO,
    userId?: string,
  ): Promise<Result<Paginated<PostInfoDTO[]>>> {
    const allBannedBlogs =
      await this.bloggerBlogsRepository.findAllBannedBlogs();
    const allBannedBlogsId = allBannedBlogs.map((b) => b._id.toString());
    const totalCount = await this.postsRepository.totalCountPostsExpectBanned(
      allBannedBlogsId,
    );
    const allPosts = await this.postsRepository.findAllPosts(
      queryData,
      allBannedBlogsId,
    );
    const paginatedPosts = await Paginated.getPaginated<PostInfoDTO[]>({
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      totalCount,
      items: await Promise.all(
        allPosts.map(async (p) => {
          return this.createPostViewInfo(p);
        }),
      ),
    });
    return new Result<Paginated<PostInfoDTO[]>>(
      ResultCode.Success,
      paginatedPosts,
      null,
    );
  }

  async findPostById(
    id: string,
    userId?: string,
  ): Promise<Result<PostInfoDTO>> {
    const postById = await this.postsRepository.findPostById(id);
    if (!postById)
      return new Result<PostInfoDTO>(
        ResultCode.NotFound,
        null,
        'post not found',
      );
    const checkBlog: Blogs = await this.bloggerBlogsRepository.findBlogById(
      postById.blogId,
    );
    if (checkBlog.blogIsBanned)
      return new Result<PostInfoDTO>(
        ResultCode.NotFound,
        null,
        'blog is banned',
      );
    const postView = await this.createPostViewInfo(postById);
    return new Result<PostInfoDTO>(ResultCode.Success, postView, null);
  }

  /*async countBannedStatusOwner(id: string, status: string) {
    const allLikes: PostLike[] = await this.postsRepository.findAllPostLikes(
      id,
      status,
    );
    const allUsersLikeOwner = allLikes.map((p) => new string(p.userId));
    return this.usersRepository.countBannedUsersInIdArray(allUsersLikeOwner);
  }*/

  /*async idBannedStatusOwner(id: string, status: string) {
    const allLikes: PostLike[] = await this.postsRepository.findAllPostLikes(
      id,
      status,
    );
    const allUsersLikeOwner = allLikes.map((p) => p.user);
    const allBannedUsers = await this.usersRepository.allIdBannedUsers(
      allUsersLikeOwner,
    );
    return allBannedUsers.map((u) => u._id.toString());
  }*/

  async createPostViewInfo(post: Posts): Promise<PostInfoDTO> {
    return new PostInfoDTO(
      post.id,
      post.title,
      post.shortDescription,
      post.content,
      post.blog,
      post.blogName,
      post.createdAt,
      {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    );
  }
}
