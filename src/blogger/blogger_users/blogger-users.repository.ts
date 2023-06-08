import { Injectable } from '@nestjs/common';
import {
  InputBanUserForBlogDTO,
  QueryBannedUsersForBlogDTO,
} from './applications/blogger-users.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BanUserForBlog } from './applications/banned-users-for-blogs.entity';

@Injectable()
export class BloggerUsersRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async updateBannedUserStatusForBlog(
    userId: string,
    inputData: InputBanUserForBlogDTO,
  ) {
    const banReason = inputData.isBanned ? inputData.banReason : null;
    const banDate = inputData.isBanned ? new Date() : null;
    const result = await this.dataSource.query(
      `
      UPDATE "ban_user_for_blog"
      SET "isBanned" = $1, "banReason" = $2, "banDate" = $3
      WHERE "userId" = $4 AND "blogId" = $5
      `,
      [inputData.isBanned, banReason, banDate, userId, inputData.blogId],
    );
    return result[1] === 1;
  }

  async createBannedUserStatusForBlog(newBannedUserStatus: BanUserForBlog) {
    await this.dataSource.query(
      `
      INSERT INTO "ban_user_for_blog"
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `,
      [
        newBannedUserStatus.id,
        newBannedUserStatus.isBanned,
        newBannedUserStatus.banDate,
        newBannedUserStatus.banReason,
        newBannedUserStatus.userLogin,
        newBannedUserStatus.blog,
        newBannedUserStatus.user,
        newBannedUserStatus.createdAt,
      ],
    );
    return newBannedUserStatus;
  }

  async totalCountBannedUsersForBlog(filter: any) {
    const searchLoginTerm = filter.searchLoginTerm
      ? filter.searchLoginTerm
      : null;
    const result = await this.dataSource.query(
      `
      SELECT COUNT("ban_user_for_blog") 
      FROM "ban_user_for_blog"
      WHERE "blogId" = $1 AND "isBanned" = true AND 
        ($2::VARCHAR is null OR LOWER("userLogin") ILIKE  '%' || $2::VARCHAR || '%')
      `,
      [filter.blogId, searchLoginTerm],
    );
    return result[0].count;
  }

  async checkUserForBan(
    userId: string,
    blogId: string,
  ): Promise<BanUserForBlog> {
    const result = await this.dataSource.query(
      `
      SELECT * FROM "ban_user_for_blog"
      WHERE "userId" = $1 AND "blogId" = $2
      `,
      [userId, blogId],
    );
    return result[0];
  }

  async findAllBannedUsersForBlog(
    filter: any,
    queryData: QueryBannedUsersForBlogDTO,
  ) {
    let sortBy = 'createdAt';
    if (queryData.sortBy) {
      sortBy = queryData.sortBy;
    }
    if (queryData.sortBy === 'login') {
      sortBy = 'userLogin';
    }
    const searchLoginTerm = filter.searchLoginTerm
      ? filter.searchLoginTerm
      : null;
    return this.dataSource.query(
      `
      SELECT * FROM "ban_user_for_blog" 
      WHERE "blogId" = $1 AND "isBanned" = true AND 
        ($2::VARCHAR is null OR LOWER("userLogin") ILIKE  '%' || $2::VARCHAR || '%')
      ORDER BY "${sortBy}" ${queryData.sortDirection}
      LIMIT $3
      OFFSET $4
      `,
      [
        filter.blogId,
        searchLoginTerm,
        queryData.pageSize,
        (queryData.pageNumber - 1) * queryData.pageSize,
      ],
    );
  }
}
