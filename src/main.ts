import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ZodValidationPipe } from 'nestjs-zod';
import { CustomZodValidationPipe } from './custom-zod-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    exposedHeaders: ['set-cookie'],
  });
  //app.useGlobalPipes(new ValidationPipe());
  app.useGlobalPipes(new ZodValidationPipe());
  //app.useGlobalPipes(new CustomZodValidationPipe());

  await app.listen(process.env.PORT ?? 7000);
}
bootstrap();
