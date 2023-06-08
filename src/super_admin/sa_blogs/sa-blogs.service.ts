import { Injectable } from '@nestjs/common';
import { SABlogsRepository } from './sa-blogs.repository';
import { BlogInfoDTO, QueryBlogsDTO } from './applications/sa-blogs.dto';
import { Result, ResultCode } from '../../helpers/contract';
import { Paginated } from '../../helpers/paginated';

@Injectable()
export class SABlogsService {
  constructor(protected saBlogsRepository: SABlogsRepository) {}

  async findAllBlogs(
    queryData: QueryBlogsDTO,
  ): Promise<Result<Paginated<BlogInfoDTO[]>>> {
    const filter = {};
    filter['searchNameTerm'] = queryData.searchNameTerm
      ? queryData.searchNameTerm
      : null;
    let sort = 'createdAt';
    if (queryData.sortBy) {
      sort = queryData.sortBy;
    }
    const totalCount = await this.saBlogsRepository.totalCountBlogs(filter);
    const allBlogs = await this.saBlogsRepository.findAllBlogs(
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
            b.id,
            b.name,
            b.description,
            b.websiteUrl,
            b.createdAt,
            b.isMembership,
            {
              userId: b.ownerId,
              userLogin: b.ownerLogin,
            },
            {
              isBanned: b.blogIsBanned,
              banDate: b.blogBanDate ? b.blogBanDate : null,
            },
          ),
      ),
    });
    return new Result<Paginated<BlogInfoDTO[]>>(
      ResultCode.Success,
      paginatedBlogs,
      null,
    );
  }
}
