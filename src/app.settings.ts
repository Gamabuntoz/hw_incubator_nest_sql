import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

export const initApp = (app: INestApplication): INestApplication => {
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      transform: true,
      exceptionFactory: (errors) => {
        const errorsForResponse = { errorsMessages: [] };
        errors.forEach((e) => {
          const constraintsKeys = Object.keys(e.constraints);
          errorsForResponse.errorsMessages.push({
            message: e.constraints[constraintsKeys[0]],
            field: e.property,
          });
        });
        throw new BadRequestException(errorsForResponse);
      },
    }),
  );
  return app;
};
