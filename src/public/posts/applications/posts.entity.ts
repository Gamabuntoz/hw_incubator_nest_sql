import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Blogs } from '../../../blogger/blogger_blogs/applications/blogger-blogs.entity';

@Entity()
export class Posts {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  content: string;
  @ManyToOne(() => Blogs, (Blog) => Blog.id, { cascade: true })
  blog: string;
  @Column()
  blogName: string;
  @Column()
  createdAt: string;
  @Column()
  likeCount: number;
  @Column()
  dislikeCount: number;
}
