import { Injectable } from '@nestjs/common';
import { QueryBlogsDTO } from '../../public/blogs/applications/blogs.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SABlogsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

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

  async banBlogById(id: string, status: boolean) {
    const result = await this.dataSource.query(
      `
      UPDATE "blogs"
      SET "blogIsBanned" = $1, "blogBanDate" = $2
      WHERE id = $3
      `,
      [status, status ? new Date().toISOString() : null, id],
    );
    return result[1] === 1;
  }

  async findAllBlogs(filter: any, sortBy: string, queryData: QueryBlogsDTO) {
    const searchNameTerm = filter.searchNameTerm ? filter.searchNameTerm : null;
    return this.dataSource.query(
      `
      SELECT * FROM "blogs" 
      WHERE ($1::VARCHAR IS NULL OR LOWER("name") ILIKE  '%' || $1::VARCHAR || '%')
      ORDER BY "${sortBy}" ${queryData.sortDirection}
      LIMIT $2
      OFFSET $3
      `,
      [
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
      WHERE ($1::VARCHAR is null OR LOWER("name") ILIKE  '%' || $1::VARCHAR || '%')
      `,
      [searchNameTerm],
    );
    return result[0].count;
  }

  async bindBlogWithUser(blogId: string, userId: string, userLogin: string) {
    const result = await this.dataSource.query(
      `
      UPDATE "blogs"
      SET "ownerId" = $1, "ownerLogin" = $2
      WHERE id = $3
      `,
      [userId, userLogin, blogId],
    );
    return result[1] === 1;
  }
}
