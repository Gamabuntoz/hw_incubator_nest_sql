import { Injectable } from '@nestjs/common';
import { BloggerUsersRepository } from './blogger-users.repository';
import { Result, ResultCode } from '../../helpers/contract';
import { Paginated } from '../../helpers/paginated';
import {
  BannedUsersForBlogInfoDTO,
  QueryBannedUsersForBlogDTO,
} from './applications/blogger-users.dto';
import { BloggerBlogsRepository } from '../blogger_blogs/blogger-blogs.repository';

@Injectable()
export class BloggerUsersService {
  constructor(
    protected bloggerUsersRepository: BloggerUsersRepository,
    protected bloggerBlogsRepository: BloggerBlogsRepository,
  ) {}

  async findAllBannedUsers(
    queryData: QueryBannedUsersForBlogDTO,
    blogId: string,
    currentUserId: string,
  ): Promise<Result<Paginated<BannedUsersForBlogInfoDTO[]>>> {
    const blog = await this.bloggerBlogsRepository.findBlogById(blogId);
    if (!blog)
      return new Result<Paginated<BannedUsersForBlogInfoDTO[]>>(
        ResultCode.NotFound,
        null,
        'blog not found',
      );
    if (blog.ownerId !== currentUserId)
      return new Result<Paginated<BannedUsersForBlogInfoDTO[]>>(
        ResultCode.Forbidden,
        null,
        'access denied',
      );
    const filter: any = { blogId: blogId, isBanned: true };
    filter['searchLoginTerm'] = queryData.searchLoginTerm
      ? queryData.searchLoginTerm
      : null;
    const totalCount =
      await this.bloggerUsersRepository.totalCountBannedUsersForBlog(filter);
    const allBannedUsersForBlog =
      await this.bloggerUsersRepository.findAllBannedUsersForBlog(
        filter,
        queryData,
      );
    const paginatedBlogs = await Paginated.getPaginated<
      BannedUsersForBlogInfoDTO[]
    >({
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      totalCount,
      items: allBannedUsersForBlog.map(
        (b) =>
          new BannedUsersForBlogInfoDTO(b.userId, b.userLogin, {
            isBanned: b.isBanned,
            banDate: b.banDate,
            banReason: b.banReason,
          }),
      ),
    });
    return new Result<Paginated<BannedUsersForBlogInfoDTO[]>>(
      ResultCode.Success,
      paginatedBlogs,
      null,
    );
  }
}
