import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter.js';
import { origenesCors } from './common/config/cors.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Usa el logger pino de nestjs-pino también para los logs internos de Nest.
  app.useLogger(app.get(Logger));

  // El front web corre en otro origen (Vite): se habilita CORS configurable.
  app.enableCors({
    origin: origenesCors(),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Inyección del adaptador HTTP para el filtro de excepciones
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  await app.listen(3000);

  const logger = app.get(Logger);
  const url = await app.getUrl();
  logger.log(`api-gastos escuchando en ${url}`, 'Bootstrap');
}

void bootstrap();
