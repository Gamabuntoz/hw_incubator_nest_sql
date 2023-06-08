import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  login: string;
  @Column()
  email: string;
  @Column()
  passwordHash: string;
  @Column()
  createdAt: string;
  @Column()
  emailConfirmationCode: string;
  @Column()
  emailIsConfirmed: boolean;
  @Column()
  emailConfirmExpirationDate: string;
  @Column({ nullable: true })
  passwordRecoveryCode: string | null;
  @Column({ nullable: true })
  passwordRecoveryExpirationDate: string | null;
  @Column()
  userIsBanned: boolean;
  @Column({ nullable: true })
  userBanReason: string | null;
  @Column({ nullable: true })
  userBanDate: string | null;
}
