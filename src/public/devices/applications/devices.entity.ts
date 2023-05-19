import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../../super_admin/sa_users/applications/users.entity';

@Entity()
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  issueAt: number;
  @Column()
  expiresAt: number;
  @Column()
  ipAddress: string;
  @Column()
  deviceName: string;
  @ManyToOne(() => User, (User) => User.id, { cascade: true })
  userId: string;
}
