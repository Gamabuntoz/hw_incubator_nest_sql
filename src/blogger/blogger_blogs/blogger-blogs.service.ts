import { Injectable } from '@nestjs/common';
import { BloggerBlogsRepository } from './blogger-blogs.repository';
import { Result, ResultCode } from '../../helpers/contract';
import { Paginated } from '../../helpers/paginated';
import {
  BloggerBlogInfoDTO,
  QueryBlogsDTO,
} from './applications/blogger-blogs.dto';

@Injectable()
export class BloggerBlogsService {
  constructor(protected bloggerBlogsRepository: BloggerBlogsRepository) {}

  async findAllBlogs(
    queryData: QueryBlogsDTO,
    currentUserId: string,
  ): Promise<Result<Paginated<BloggerBlogInfoDTO[]>>> {
    const filter: any = { ownerId: currentUserId };
    filter['searchNameTerm'] = queryData.searchNameTerm
      ? queryData.searchNameTerm
      : null;
    const totalCount = await this.bloggerBlogsRepository.totalCountBlogs(
      filter,
    );
    const allBlogs = await this.bloggerBlogsRepository.findAllBlogs(
      filter,
      queryData,
    );
    const paginatedBlogs = await Paginated.getPaginated<BloggerBlogInfoDTO[]>({
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      totalCount,
      items: allBlogs.map(
        (b) =>
          new BloggerBlogInfoDTO(
            b._id.toString(),
            b.name,
            b.description,
            b.websiteUrl,
            b.createdAt,
            b.isMembership,
          ),
      ),
    });
    return new Result<Paginated<BloggerBlogInfoDTO[]>>(
      ResultCode.Success,
      paginatedBlogs,
      null,
    );
  }
}
