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
      UPDATE "banuserforblog"
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
      INSERT INTO "banuserforblog"
      VALUES ($1, $2, $3, $4, $5, $6, $7);
      `,
      [
        newBannedUserStatus.id,
        newBannedUserStatus.blog,
        newBannedUserStatus.isBanned,
        newBannedUserStatus.banDate,
        newBannedUserStatus.banReason,
        newBannedUserStatus.user,
        newBannedUserStatus.userLogin,
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
      SELECT COUNT("banuserforblog") 
      FROM public."banuserforblog"
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
    return this.dataSource.query(
      `
      SELECT * FROM public."banuserforblog"
      WHERE "userId" = $1 AND "blogId" = $2
      `,
      [userId, blogId],
    );
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
      SELECT * FROM public."banuserforblog" 
      WHERE "blogId" = $1 AND "isBanned" = true AND 
        ($2::VARCHAR is null OR LOWER("userLogin") ILIKE  '%' || $2::VARCHAR || '%')
      ORDER BY "${sortBy}" ${queryData.sortDirection}
      LIMIT $3
      OFFSET $4
      `,
      [
        filter.ownerId,
        searchLoginTerm,
        queryData.pageSize,
        (queryData.pageNumber - 1) * queryData.pageSize,
      ],
    );
  }
}
