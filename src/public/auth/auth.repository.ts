import { Injectable } from '@nestjs/common';
import { Users } from '../../super_admin/sa_users/applications/users.entity';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

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

  async countBannedUsersPostLikeOwner(postId: string, status: string) {
    const result = await this.dataSource.query(
      `
      SELECT COUNT("users") 
      FROM "users"
      WHERE "id" IN (
            SELECT "userId" FROM "post_likes" 
            WHERE "postId" = $1 AND "status" = $2
            ) 
            AND "userIsBanned" = true
      `,
      [postId, status],
    );
    return result[0].count;
  }

  async countBannedUsersCommentLikeOwner(commentId: string, status: string) {
    const result = await this.dataSource.query(
      `
      SELECT COUNT("users") 
      FROM "users"
      WHERE "id" IN (
            SELECT "userId" FROM "comment_likes" 
            WHERE "commentId" = $1 AND "status" = $2
            ) 
            AND "userIsBanned" = true
      `,
      [commentId, status],
    );
    return result[0].count;
  }

  async findUserByLoginOrEmail(loginOrEmail: string) {
    const result = await this.dataSource.query(
      `
      SELECT * FROM "users"
      WHERE "login" = $1 OR "email" = $1
      `,
      [loginOrEmail],
    );
    if (!result[0]) return false;
    return result[0];
  }

  async findUserByRecoveryCode(code: string) {
    const result = await this.dataSource.query(
      `
      SELECT * FROM "users"
      WHERE "passwordRecoverCode" = $1
      `,
      [code],
    );
    return result[0];
  }

  async findUserByConfirmationCode(code: string) {
    const result = await this.dataSource.query(
      `
      SELECT * FROM "users"
      WHERE "emailConfirmationCode" = $1
      `,
      [code],
    );
    return result[0];
  }

  async updateConfirmation(id: string) {
    const result = await this.dataSource.query(
      `
      UPDATE "users"
      SET "emailIsConfirmed" = true
      WHERE id = $1
      `,
      [id],
    );
    return result[1] === 1;
  }

  async setNewConfirmationCode(id: string): Promise<boolean> {
    const newCode = uuidv4();
    const newDate = add(new Date(), {
      hours: 1,
    });
    const result = await this.dataSource.query(
      `
      UPDATE "users"
      SET "emailConfirmationCode" = $1, "emailConfirmExpirationDate" = $2
      WHERE "id" = $3
      `,
      [newCode, newDate, id],
    );
    return result[1] === 1;
  }

  async createPasswordRecoveryCode(id: string) {
    const newCode = uuidv4();
    const newDate = add(new Date(), {
      hours: 1,
    });
    const result = await this.dataSource.query(
      `
      UPDATE "users"
      SET "passwordRecoveryCode" = $1, "passwordRecoveryExpirationDate" = $2
      WHERE id = $3
      `,
      [newCode, newDate, id],
    );
    return result[1] === 1;
  }

  async updatePassword(id: string, passwordHash: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
      UPDATE "users"
      SET "passwordHash" = $1
      WHERE id = $2
      `,
      [passwordHash, id],
    );
    return result[1] === 1;
  }
}
