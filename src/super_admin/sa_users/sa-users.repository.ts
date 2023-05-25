import { Injectable } from '@nestjs/common';
import { Users } from './applications/users.entity';
import { FilterQuery } from 'mongoose';
import { InputBanUserDTO, QueryUsersDTO } from './applications/sa-users.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SAUsersRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findAllUsers(filter: FilterQuery<Users>, queryData: QueryUsersDTO) {
    let sortBy = 'createdAt';
    if (queryData.sortBy) {
      sortBy = queryData.sortBy;
    }
    const banStatus = filter.banStatus ? filter.banStatus : null;
    const searchLoginTerm = filter.searchLoginTerm
      ? filter.searchLoginTerm
      : null;
    const searchEmailTerm = filter.searchEmailTerm
      ? filter.searchEmailTerm
      : null;
    return this.dataSource.query(
      `
      SELECT * FROM "users" 
      WHERE ("userIsBanned" = $1::BOOLEAN OR $1::BOOLEAN IS NULL) AND
        (($2::VARCHAR IS NULL OR LOWER("login") ILIKE  '%' || $2::VARCHAR || '%')  OR
        ($3::VARCHAR IS NULL OR LOWER("email") ILIKE  '%' || $3::VARCHAR || '%'))
      ORDER BY "${sortBy}" ${queryData.sortDirection}
      LIMIT $4
      OFFSET $5
      `,
      [
        banStatus,
        searchLoginTerm,
        searchEmailTerm,
        queryData.pageSize,
        (queryData.pageNumber - 1) * queryData.pageSize,
      ],
    );
  }

  async totalCountUsers(filter) {
    const banStatus = filter.banStatus ? filter.banStatus : null;
    const searchLoginTerm = filter.searchLoginTerm
      ? filter.searchLoginTerm
      : null;
    const searchEmailTerm = filter.searchEmailTerm
      ? filter.searchEmailTerm
      : null;
    const result = await this.dataSource.query(
      `
      SELECT COUNT("users") 
      FROM "users"
      WHERE ($1::BOOLEAN IS NULL OR "userIsBanned" = $1::BOOLEAN) AND
        (($2::VARCHAR is null OR LOWER("login") ILIKE  '%' || $2::VARCHAR || '%')  or
        ($3::VARCHAR is null OR LOWER("email") ILIKE  '%' || $3::VARCHAR || '%'))
      `,
      [banStatus, searchLoginTerm, searchEmailTerm],
    );
    return result[0].count;
  }

  async createUser(newUser: Users) {
    await this.dataSource.query(
      `
      INSERT INTO "users"
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
      `,
      [
        newUser.id,
        newUser.login,
        newUser.email,
        newUser.passwordHash,
        newUser.createdAt,
        newUser.emailConfirmationCode,
        newUser.emailIsConfirmed,
        newUser.emailConfirmExpirationDate,
        newUser.passwordRecoveryCode,
        newUser.passwordRecoveryExpirationDate,
        newUser.userIsBanned,
        newUser.userBanReason,
        newUser.userBanDate,
      ],
    );
    return newUser;
  }

  async findUserById(id: string) {
    const result = await this.dataSource.query(
      `
      SELECT * FROM "users"
      WHERE "id" = $1
      `,
      [id],
    );
    return result[0];
  }

  async updateUserBanStatus(userId: string, inputData: InputBanUserDTO) {
    const result = await this.dataSource.query(
      `
      UPDATE "users"
      SET "userIsBanned" = $1, "userBanReason" = $2, "userBanDate" = $3
      WHERE id = $4
      `,
      [
        inputData.isBanned,
        inputData.isBanned ? inputData.banReason : null,
        inputData.isBanned ? new Date().toISOString() : null,
        userId,
      ],
    );
    return result[1] === 1;
  }

  async deleteUser(id: string) {
    const result = await this.dataSource.query(
      `
      DELETE FROM "users"
      WHERE "id" = $1
      `,
      [id],
    );
    return result[1] === 1;
  }
}
