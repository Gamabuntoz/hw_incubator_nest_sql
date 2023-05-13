import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type DeviceDocument = HydratedDocument<Device>;

@Schema()
export class Device {
  @Prop({ required: true })
  _id: Types.ObjectId;
  @Prop({ required: true })
  issueAt: number;
  @Prop({ required: true })
  expiresAt: number;
  @Prop({ required: true })
  ipAddress: string;
  @Prop({ required: true })
  deviceName: string;
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  deviceId: string;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
