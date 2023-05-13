import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

class AccountData {
  @Prop({ required: true })
  login: string;
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  passwordHash: string;
  @Prop({ required: true })
  createdAt: string;
}

class EmailConfirmation {
  @Prop({ required: true })
  confirmationCode: string;
  @Prop({ required: true })
  isConfirmed: boolean;
  @Prop({ required: true })
  expirationDate: Date;
}

class PasswordRecovery {
  @Prop()
  code: string;
  @Prop()
  expirationDate: Date;
}

class BanInformation {
  @Prop()
  isBanned: boolean;
  @Prop()
  banReason: string | null;
  @Prop()
  banDate: Date | null;
}

@Schema()
export class User {
  @Prop({ required: true })
  _id: Types.ObjectId;
  @Prop({ type: AccountData })
  accountData: AccountData;
  @Prop({ type: EmailConfirmation })
  emailConfirmation: EmailConfirmation;
  @Prop({ type: PasswordRecovery })
  passwordRecovery: PasswordRecovery;
  @Prop({ type: BanInformation })
  banInformation: BanInformation;
}

export const UserSchema = SchemaFactory.createForClass(User);
