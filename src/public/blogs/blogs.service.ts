import { Injectable } from '@nestjs/common';
import { BlogsRepository } from './blogs.repository';
import { PostsRepository } from '../posts/posts.repository';
import { PostsService } from '../posts/posts.service';
import { PostInfoDTO, QueryPostsDTO } from '../posts/applications/posts.dto';
import { Types } from 'mongoose';
import { BlogInfoDTO, QueryBlogsDTO } from './applications/blogs.dto';
import { Result, ResultCode } from '../../helpers/contract';
import { Paginated } from '../../helpers/paginated';

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
    const totalCount = await this.postsRepository.totalCountPostsByBlogId(
      id.toString(),
    );
    const allPosts = await this.postsRepository.findAllPostsByBlogId(
      id.toString(),
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
            await this.postsService.countBannedStatusOwner(p._id, 'Like');
          const countBannedDislikesOwner =
            await this.postsService.countBannedStatusOwner(p._id, 'Dislike');
          const idBannedUsers = await this.postsService.idBannedStatusOwner(
            p._id,
            'Like',
          );
          if (userId) {
            likeStatusCurrentUser =
              await this.postsRepository.findPostLikeByPostAndUserId(
                p._id.toString(),
                userId,
              );
          }
          const lastPostLikes = await this.postsRepository.findLastPostLikes(
            p._id.toString(),
            idBannedUsers,
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
    let filter: any = { 'banInformation.isBanned': false };
    if (queryData.searchNameTerm) {
      filter = {
        'banInformation.isBanned': false,
        name: { $regex: queryData.searchNameTerm, $options: 'i' },
      };
    }
    let sort = 'createdAt';
    if (queryData.sortBy) {
      sort = queryData.sortBy;
    }
    const totalCount = await this.blogsRepository.totalCountBlogs(filter);
    const allBlogs = await this.blogsRepository.findAllBlogs(
      filter,
      sort,
      queryData,
    );
    const paginatedBlogs = await Paginated.getPaginated<BlogInfoDTO[]>({
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      totalCount,
      items: allBlogs.map(
        (b) =>
          new BlogInfoDTO(
            b._id.toString(),
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
    const blogById = await this.blogsRepository.findBlogById(id);
    if (!blogById || blogById.banInformation.isBanned)
      return new Result<BlogInfoDTO>(
        ResultCode.NotFound,
        null,
        'Blog not found',
      );
    const blogView = new BlogInfoDTO(
      blogById._id.toString(),
      blogById.name,
      blogById.description,
      blogById.websiteUrl,
      blogById.createdAt,
      blogById.isMembership,
    );
    return new Result<BlogInfoDTO>(ResultCode.Success, blogView, null);
  }
}
