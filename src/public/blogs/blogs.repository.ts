import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { QueryBlogsDTO } from './applications/blogs.dto';
import {
  Blog,
  BlogDocument,
} from '../../blogger/blogger_blogs/applications/blogger-blogs.entity';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async findAllBlogs(filter: any, sort: string, queryData: QueryBlogsDTO) {
    return this.blogModel
      .find(filter)
      .sort({ [sort]: queryData.sortDirection === 'asc' ? 1 : -1 })
      .skip((queryData.pageNumber - 1) * queryData.pageSize)
      .limit(queryData.pageSize)
      .lean();
  }

  async totalCountBlogs(filter: any) {
    return this.blogModel.countDocuments(filter);
  }

  async findBlogById(id: string) {
    return this.blogModel.findOne({
      _id: id,
    });
  }
}
