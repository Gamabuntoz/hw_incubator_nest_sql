import { Injectable } from '@nestjs/common';
import { QueryBlogsDTO } from './applications/blogs.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findAllBlogs(filter: any, queryData: QueryBlogsDTO) {
    let sortBy = 'createdAt';
    if (queryData.sortBy) {
      sortBy = queryData.sortBy;
    }
    const searchNameTerm = filter.searchNameTerm ? filter.searchNameTerm : null;
    return this.dataSource.query(
      `
      SELECT * FROM "blogs" 
      WHERE "blogIsBanned" = $1 AND
        ($2::VARCHAR is null OR LOWER("name") ILIKE  '%' || $2::VARCHAR || '%')
      ORDER BY "${sortBy}" ${queryData.sortDirection}
      LIMIT $3
      OFFSET $4
      `,
      [
        filter.blogIsBanned,
        searchNameTerm,
        queryData.pageSize,
        (queryData.pageNumber - 1) * queryData.pageSize,
      ],
    );
  }

  async totalCountBlogs(filter: any) {
    const searchNameTerm = filter.searchNameTerm ? filter.searchNameTerm : null;
    const result = await this.dataSource.query(
      `
      SELECT COUNT("blogs") 
      FROM "blogs"
      WHERE "blogIsBanned" = $1 AND
        ($2::VARCHAR is null OR LOWER("name") ILIKE  '%' || $2::VARCHAR || '%')
      `,
      [filter.blogIsBanned, searchNameTerm],
    );
    return result[0].count;
  }

  async findBlogById(id: string) {
    const result = await this.dataSource.query(
      `
      SELECT * FROM "blogs"
      WHERE "id" = $1
      `,
      [id],
    );
    return result[0];
  }
}
