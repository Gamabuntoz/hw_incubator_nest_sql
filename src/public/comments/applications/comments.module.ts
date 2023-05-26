import { Module } from '@nestjs/common';
import { CommentsController } from '../comments.controller';
import { CommentsService } from '../comments.service';
import { CommentsRepository } from '../comments.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './comments.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsRepository],
})
export class CommentsModule {}
