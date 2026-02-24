import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error', 'debug', 'verbose'],
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  // CORS habilitado
  app.enableCors({
    origin: process.env.FRONTEND_URL!,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const port = process.env.PORT!;
  const host = process.env.HOST!;

  await app.listen(port, host);
  logger.log(`Application is running on: http://${host}:${port}/api`);
}
bootstrap();
