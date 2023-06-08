import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from '../../../super_admin/sa_users/applications/users.entity';
import { Blogs } from '../../blogger_blogs/applications/blogger-blogs.entity';

@Entity()
export class BanUserForBlog {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @ManyToOne(() => Blogs, (Blog) => Blog.id, { cascade: true })
  blog: string;
  @Column()
  isBanned: boolean;
  @Column({ nullable: true })
  banDate: string | null;
  @Column()
  createdAt: string;
  @Column({ nullable: true })
  banReason: string | null;
  @ManyToOne(() => Users, (User) => User.id, { cascade: true })
  user: string;
  @Column()
  userLogin: string;
}
