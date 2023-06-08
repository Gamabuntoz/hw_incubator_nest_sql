import { Users } from 'src/super_admin/sa_users/applications/users.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Comments } from './comments.entity';

@Entity()
export class CommentLikes {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  status: string;
  @Column()
  addedAt: string;
  @ManyToOne(() => Users, (User) => User.id, { cascade: true })
  user: string;
  @ManyToOne(() => Comments, (Comment) => Comment.id, { cascade: true })
  comment: string;
}
