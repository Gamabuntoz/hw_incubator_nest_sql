import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../super_admin/sa_users/applications/users.entity';
import { Device } from '../public/devices/applications/devices.entity';

@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: this.configService.get('DB_URL'),
      autoLoadEntities: true,
      entities: [User, Device],
      synchronize: true,
    };
  }
}
