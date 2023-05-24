import { Module } from '@nestjs/common';
import { PostsController } from '../posts.controller';
import { PostsService } from '../posts.service';
import { PostsRepository } from '../posts.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './posts.entity';
import { BlogsModule } from '../../blogs/applications/blogs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsRepository],
})
export class PostsModule {}
