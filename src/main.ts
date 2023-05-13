import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './exception.filters';
import { initApp } from './app.settings';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  initApp(app);
  //app.useGlobalFilters(new HttpExceptionFilter(), new DamainExceptionFilter());
  await app.listen(5000);
}
bootstrap();
