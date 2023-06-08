import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Users } from '../super_admin/sa_users/applications/users.entity';
import { Devices } from '../public/devices/applications/devices.entity';
import { Posts } from '../public/posts/applications/posts.entity';
import { Blogs } from '../blogger/blogger_blogs/applications/blogger-blogs.entity';
import { BanUserForBlog } from '../blogger/blogger_users/applications/banned-users-for-blogs.entity';
import { PostLikes } from '../public/posts/applications/posts-likes.entity';
import { Comments } from '../public/comments/applications/comments.entity';
import { CommentLikes } from '../public/comments/applications/comments-likes.entity';

@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: this.configService.get('DB_URL'),
      autoLoadEntities: true,
      entities: [
        Users,
        Devices,
        Posts,
        Blogs,
        BanUserForBlog,
        PostLikes,
        Comments,
        CommentLikes,
      ],
      synchronize: true,
    };
  }
}
