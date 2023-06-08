import { Users } from 'src/super_admin/sa_users/applications/users.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Posts } from './posts.entity';

@Entity()
export class PostLikes {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  status: string;
  @Column()
  addedAt: string;
  @ManyToOne(() => Users, (User) => User.id, { cascade: true })
  user: string;
  @ManyToOne(() => Posts, (Post) => Post.id, { cascade: true })
  post: string;
}
