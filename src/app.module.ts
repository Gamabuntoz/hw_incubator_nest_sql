import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestingController } from './testing/testing.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthRepository } from './public/auth/auth.repository';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './helpers/constants';
import { LocalStrategy } from './security/strategies/local.strategy';
import { JwtAccessStrategy } from './security/strategies/jwt-access.strategy';
import { BasicStrategy } from './security/strategies/basic.strategy';
import { OptionalJwtAuthGuard } from './security/guards/optional-jwt-auth.guard';
import { EmailAdapter } from './adapters/email-adapter/email.adapter';
import { AuthController } from './public/auth/auth.controller';
import { AuthService } from './public/auth/auth.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { DevicesRepository } from './public/devices/devices.repository';
import { DevicesController } from './public/devices/devices.controller';
import { DevicesService } from './public/devices/devices.service';
import { LoginOrEmailExistRule } from './helpers/decorators/validate-email-and-login.param.decorator';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfirmEmailUseCases } from './public/auth/applications/use-cases/confirm-email-for-registration-use-cases';
import { LoginUserUseCases } from './public/auth/applications/use-cases/login-user-use-cases';
import { NewPasswordUseCases } from './public/auth/applications/use-cases/new-user-password-use-cases';
import { PasswordRecoveryUseCases } from './public/auth/applications/use-cases/recovery-user-password-use-cases';
import { RefreshTokensUseCases } from './public/auth/applications/use-cases/refresh-user-tokens-user-use-cases';
import { RegistrationUserUseCases } from './public/auth/applications/use-cases/registration-user-use-cases';
import { ResendEmailUseCases } from './public/auth/applications/use-cases/resend-email-for-registration-use-cases';
import { VerifyTokenUseCases } from './public/auth/applications/use-cases/verify-token-use-cases';
import { LogoutUserUseCases } from './public/auth/applications/use-cases/logout-user-use-cases';
import { DeleteAllDeviceSessionsUseCases } from './public/devices/applications/use-cases/delete-all-device-sessions-use-cases';
import { DeleteDeviceSessionUseCases } from './public/devices/applications/use-cases/delete-device-session-use-cases';
import { ValidatePasswordRecoveryCodeRule } from './helpers/decorators/validate-password-recovery-code.param.decorator';
import { ValidateRegistrationConfirmationCodeRule } from './helpers/decorators/validate-registration-confirmation-code.param.decorator';
import { ValidateEmailForResendCodeRule } from './helpers/decorators/validate-email-for-resend-code.param.decorator';
import { SAUsersController } from './super_admin/sa_users/sa-users.controller';
import { SAUsersService } from './super_admin/sa_users/sa-users.service';
import { BanUserUseCases } from './super_admin/sa_users/applications/use-cases/ban-user-use-cases';
import { CreateUserByAdminUseCases } from './super_admin/sa_users/applications/use-cases/create-user-by-admin-use-case';
import { DeleteUserUseCases } from './super_admin/sa_users/applications/use-cases/delete-user-use-cases';
import { SAUsersRepository } from './super_admin/sa_users/sa-users.repository';
import { TypeOrmConfig } from './configs/type-orm.config';
import { PostsController } from './public/posts/posts.controller';
import { BlogExistsRule } from './helpers/decorators/validate-blog-id.param.decorator';
import { PostsRepository } from './public/posts/posts.repository';
import { BlogsRepository } from './public/blogs/blogs.repository';
import { BloggerUsersRepository } from './blogger/blogger_users/blogger-users.repository';
import { SABlogsRepository } from './super_admin/sa_blogs/sa-blogs.repository';
import { BloggerBlogsRepository } from './blogger/blogger_blogs/blogger-blogs.repository';
import { BloggerUsersService } from './blogger/blogger_users/blogger-users.service';
import { BloggerBlogsService } from './blogger/blogger_blogs/blogger-blogs.service';
import { SABlogsService } from './super_admin/sa_blogs/sa-blogs.service';
import { BlogsService } from './public/blogs/blogs.service';
import { PostsService } from './public/posts/posts.service';
import { BlogsController } from './public/blogs/blogs.controller';
import { BloggerUsersController } from './blogger/blogger_users/blogger-users.controller';
import { BloggerBlogsController } from './blogger/blogger_blogs/blogger-blogs.controller';
import { SABlogsController } from './super_admin/sa_blogs/sa-blogs.controller';
import { CreateBlogUseCases } from './blogger/blogger_blogs/applications/use-cases/create-blog-use-cases';
import { CreatePostWithBlogIdUseCases } from './blogger/blogger_blogs/applications/use-cases/create-post-by-blog-id-use-cases';
import { DeleteBlogUseCases } from './blogger/blogger_blogs/applications/use-cases/delete-blog-use-cases';
import { DeletePostUseCases } from './blogger/blogger_blogs/applications/use-cases/delete-post-by-blog-id-use-cases';
import { UpdateBlogUseCases } from './blogger/blogger_blogs/applications/use-cases/update-blog-use-cases';
import { UpdatePostUseCases } from './blogger/blogger_blogs/applications/use-cases/update-post-by-blog-id-use-cases';
import { BanUserForBlogUseCases } from './blogger/blogger_users/applications/use-cases/ban-user-for-blog-use-cases';
import { BanBlogByIdUseCases } from './super_admin/sa_blogs/applications/use-cases/ban-blog-by-id-use-cases';
import { BindBlogWithUserUseCases } from './super_admin/sa_blogs/applications/use-cases/bind-blog-with-user-use-cases';

const useCases = [
  BanUserForBlogUseCases,
  BanUserUseCases,
  BanBlogByIdUseCases,
  BindBlogWithUserUseCases,
  CreateUserByAdminUseCases,
  CreateBlogUseCases,
  CreatePostWithBlogIdUseCases,
  DeleteBlogUseCases,
  DeletePostUseCases,
  DeleteUserUseCases,
  UpdateBlogUseCases,
  UpdatePostUseCases,
  ConfirmEmailUseCases,
  LoginUserUseCases,
  LogoutUserUseCases,
  NewPasswordUseCases,
  PasswordRecoveryUseCases,
  RefreshTokensUseCases,
  RegistrationUserUseCases,
  ResendEmailUseCases,
  VerifyTokenUseCases,
  DeleteAllDeviceSessionsUseCases,
  DeleteDeviceSessionUseCases,
];
const strategies = [
  LocalStrategy,
  JwtAccessStrategy,
  BasicStrategy,
  OptionalJwtAuthGuard,
];
const decorators = [
  BlogExistsRule,
  LoginOrEmailExistRule,
  ValidatePasswordRecoveryCodeRule,
  ValidateRegistrationConfirmationCodeRule,
  ValidateEmailForResendCodeRule,
];
const repositories = [
  SAUsersRepository,
  AuthRepository,
  DevicesRepository,
  PostsRepository,
  BlogsRepository,
  BloggerUsersRepository,
  SABlogsRepository,
  BloggerBlogsRepository,
];
const services = [
  AuthService,
  AppService,
  SAUsersService,
  DevicesService,
  BloggerUsersService,
  BloggerBlogsService,
  SABlogsService,
  BlogsService,
  PostsService,
];
const adapters = [EmailAdapter];
const controllers = [
  PostsController,
  AppController,
  TestingController,
  SAUsersController,
  AuthController,
  DevicesController,
  BlogsController,
  BloggerUsersController,
  BloggerBlogsController,
  SABlogsController,
];

@Module({
  imports: [
    CqrsModule,
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
    ConfigModule.forRoot(),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secretKey,
      signOptions: { expiresIn: '5m' },
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfig,
      imports: [ConfigModule],
    }),
  ],
  controllers: [...controllers],
  providers: [
    ...services,
    ...repositories,
    ...useCases,
    ...strategies,
    ...decorators,
    ...adapters,
  ],
})
export class AppModule {}
