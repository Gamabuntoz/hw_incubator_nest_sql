import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('all-data')
  async deleteAllData() {
    {
    }
    await this.dataSource.query(
      `
      DELETE FROM "comment_likes" CASCADE;
      DELETE FROM "comments" CASCADE;
      DELETE FROM "post_likes" CASCADE;
      DELETE FROM "devices" CASCADE;
      DELETE FROM "posts" CASCADE;
      DELETE FROM "ban_user_for_blog" CASCADE;
      DELETE FROM "blogs" CASCADE;
      DELETE FROM "users" CASCADE;
      `,
    );
    return;
  }
}
