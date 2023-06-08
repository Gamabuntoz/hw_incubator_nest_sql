import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from '../../../super_admin/sa_users/applications/users.entity';

@Entity()
export class Devices {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'numeric' })
  issueAt: number;
  @Column({ type: 'numeric' })
  expiresAt: number;
  @Column()
  ipAddress: string;
  @Column()
  deviceName: string;
  @ManyToOne(() => Users, (User) => User.id, { cascade: true })
  user: string;
}
