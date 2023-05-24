import { Injectable } from '@nestjs/common';
import { Blogs } from './applications/blogger-blogs.entity';
import { InputBlogDTO, QueryBlogsDTO } from './applications/blogger-blogs.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BloggerBlogsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findAllBlogs(filter: any, queryData: QueryBlogsDTO) {
    let sortBy = 'createdAt';
    if (queryData.sortBy) {
      sortBy = queryData.sortBy;
    }
    const searchNameTerm = filter.searchNameTerm ? filter.searchNameTerm : null;
    return this.dataSource.query(
      `
      SELECT * FROM public."blogs" 
      WHERE "ownerId" = $1 AND
        ($2::VARCHAR is null OR LOWER("name") ILIKE  '%' || $2::VARCHAR || '%')
      ORDER BY "${sortBy}" ${queryData.sortDirection}
      LIMIT $3
      OFFSET $4
      `,
      [
        filter.ownerId,
        searchNameTerm,
        queryData.pageSize,
        (queryData.pageNumber - 1) * queryData.pageSize,
      ],
    );
  }

  async findAllBannedBlogs() {
    return this.dataSource.query(
      `
      SELECT * FROM public."blogs"
      WHERE "blogIsBanned" = true
      `,
    );
  }

  async totalCountBlogs(filter: any) {
    const searchNameTerm = filter.searchNameTerm ? filter.searchNameTerm : null;
    const result = await this.dataSource.query(
      `
      SELECT COUNT("blogs") 
      FROM public."blogs"
      WHERE "ownerId" = $1 AND
        ($2::VARCHAR is null OR LOWER("name") ILIKE  '%' || $2::VARCHAR || '%')
      `,
      [filter.ownerId, searchNameTerm],
    );
    return result[0].count;
  }

  async findBlogById(id: string) {
    return this.dataSource.query(
      `
      SELECT * FROM public."blogs"
      WHERE "id" = $1
      `,
      [id],
    );
  }

  async createBlog(newBlog: Blogs) {
    await this.dataSource.query(
      `
      INSERT INTO "users"
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
      `,
      [
        newBlog.id,
        newBlog.createdAt,
        newBlog.name,
        newBlog.description,
        newBlog.websiteUrl,
        newBlog.isMembership,
        newBlog.owner,
        newBlog.ownerLogin,
        newBlog.blogIsBanned,
        newBlog.blogBanDate,
      ],
    );
    return newBlog;
  }

  async updateBlog(id: string, inputBlogData: InputBlogDTO) {
    const result = await this.dataSource.query(
      `
      UPDATE "blogs"
      SET "name" = $1, "description" = $2, "websiteUrl" = $3
      WHERE id = $4
      `,
      [
        inputBlogData.name,
        inputBlogData.description,
        inputBlogData.websiteUrl,
        id,
      ],
    );
    return result[1] === 1;
  }

  async deleteBlog(id: string) {
    const result = await this.dataSource.query(
      `
      DELETE FROM "blogs"
      WHERE "id" = $1
      `,
      [id],
    );
    return result[1] === 1;
  }
}
