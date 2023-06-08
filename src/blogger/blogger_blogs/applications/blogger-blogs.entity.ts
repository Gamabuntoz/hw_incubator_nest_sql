import { Users } from 'src/super_admin/sa_users/applications/users.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Blogs {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  createdAt: string;
  @Column()
  name: string;
  @Column()
  description: string;
  @Column()
  websiteUrl: string;
  @Column()
  isMembership: boolean;
  @ManyToOne(() => Users, (User) => User.id, { cascade: true })
  owner: string;
  @Column()
  ownerLogin: string;
  @Column()
  blogIsBanned: boolean;
  @Column({ nullable: true })
  blogBanDate: string | null;
}
