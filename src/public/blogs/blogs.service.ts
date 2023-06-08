import { Injectable } from '@nestjs/common';
import { BlogsRepository } from './blogs.repository';
import { PostsRepository } from '../posts/posts.repository';
import { PostsService } from '../posts/posts.service';
import { PostInfoDTO, QueryPostsDTO } from '../posts/applications/posts.dto';
import { BlogInfoDTO, QueryBlogsDTO } from './applications/blogs.dto';
import { Result, ResultCode } from '../../helpers/contract';
import { Paginated } from '../../helpers/paginated';
import { Blogs } from '../../blogger/blogger_blogs/applications/blogger-blogs.entity';

@Injectable()
export class BlogsService {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsRepository,
    protected postsService: PostsService,
  ) {}

  async findAllPostsByBlogId(
    id: string,
    queryData: QueryPostsDTO,
    userId?: string,
  ): Promise<Result<Paginated<PostInfoDTO[]>>> {
    const blogById = await this.blogsRepository.findBlogById(id);
    if (!blogById)
      return new Result<Paginated<PostInfoDTO[]>>(
        ResultCode.NotFound,
        null,
        'Blog not found',
      );
    const totalCount = await this.postsRepository.totalCountPostsByBlogId(id);
    const allPosts = await this.postsRepository.findAllPostsByBlogId(
      id,
      queryData,
    );
    const paginatedPosts = await Paginated.getPaginated<PostInfoDTO[]>({
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      totalCount,
      items: await Promise.all(
        allPosts.map(async (p) => {
          let likeStatusCurrentUser;
          const countBannedLikesOwner =
            await this.postsService.countBannedStatusOwner(p.id, 'Like');
          const countBannedDislikesOwner =
            await this.postsService.countBannedStatusOwner(p.id, 'Dislike');
          if (userId) {
            likeStatusCurrentUser =
              await this.postsRepository.findPostLikeByPostAndUserId(
                p.id,
                userId,
              );
          }
          const lastPostLikes = await this.postsRepository.findLastPostLikes(
            p.id,
          );
          return this.postsService.createPostViewInfo(
            p,
            lastPostLikes,
            likeStatusCurrentUser,
            countBannedLikesOwner,
            countBannedDislikesOwner,
          );
        }),
      ),
    });
    return new Result<Paginated<PostInfoDTO[]>>(
      ResultCode.Success,
      paginatedPosts,
      null,
    );
  }

  async findAllBlogs(
    queryData: QueryBlogsDTO,
  ): Promise<Result<Paginated<BlogInfoDTO[]>>> {
    const filter: any = { blogIsBanned: false };
    filter['searchNameTerm'] = queryData.searchNameTerm
      ? queryData.searchNameTerm
      : null;
    const totalCount = await this.blogsRepository.totalCountBlogs(filter);
    const allBlogs: Blogs[] = await this.blogsRepository.findAllBlogs(
      filter,
      queryData,
    );
    const paginatedBlogs = await Paginated.getPaginated<BlogInfoDTO[]>({
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      totalCount,
      items: allBlogs.map(
        (b) =>
          new BlogInfoDTO(
            b.id,
            b.name,
            b.description,
            b.websiteUrl,
            b.createdAt,
            b.isMembership,
          ),
      ),
    });
    return new Result<Paginated<BlogInfoDTO[]>>(
      ResultCode.Success,
      paginatedBlogs,
      null,
    );
  }

  async findBlogById(id: string): Promise<Result<BlogInfoDTO>> {
    const blogById: Blogs = await this.blogsRepository.findBlogById(id);
    if (!blogById || blogById.blogIsBanned)
      return new Result<BlogInfoDTO>(
        ResultCode.NotFound,
        null,
        'Blog not found',
      );
    const blogView = new BlogInfoDTO(
      blogById.id,
      blogById.name,
      blogById.description,
      blogById.websiteUrl,
      blogById.createdAt,
      blogById.isMembership,
    );
    return new Result<BlogInfoDTO>(ResultCode.Success, blogView, null);
  }
}
