import { Module } from '@nestjs/common';
import { BlogsController } from '../blogs.controller';
import { BlogsRepository } from '../blogs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsService } from '../blogs.service';
import {
  Blog,
  BlogSchema,
} from '../../../blogger/blogger_blogs/applications/blogger-blogs.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsRepository],
  exports: [BlogsService, BlogsRepository],
})
export class BlogsModule {}
