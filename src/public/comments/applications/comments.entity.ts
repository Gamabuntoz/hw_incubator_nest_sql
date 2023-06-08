import { Users } from 'src/super_admin/sa_users/applications/users.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Posts } from '../../posts/applications/posts.entity';

@Entity()
export class Comments {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  content: string;
  @Column()
  createdAt: string;
  @Column()
  userLogin: string;
  @Column()
  likeCount: number;
  @Column()
  dislikeCount: number;
  @ManyToOne(() => Users, (User) => User.id, { cascade: true })
  user: string;
  @ManyToOne(() => Posts, (Post) => Post.id, { cascade: true })
  post: string;
}
