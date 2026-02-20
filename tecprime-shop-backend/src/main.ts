import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // CORS habilitado
  app.enableCors({
    origin: process.env.FRONTEND_URL!,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const port = process.env.PORT!;
  const host = process.env.HOST!;

  await app.listen(port, host);
  console.log(`Application is running on: http://${host}:${port}/api`);
}
bootstrap();
