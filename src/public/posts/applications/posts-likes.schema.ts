import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PostLikeDocument = HydratedDocument<PostLike>;

@Schema()
export class PostLike {
  @Prop({ required: true })
  _id: string;
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  postId: string;
  @Prop({ required: true })
  status: string;
  @Prop({ required: true })
  addedAt: Date;
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);
