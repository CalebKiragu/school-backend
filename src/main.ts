// Import polyfills first
import './polyfills';

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';
import { loggerConfig } from './common/logger.config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: loggerConfig,
  });

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Disable global validation pipes temporarily to test admin endpoints
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: false, // Don't strip extra properties
  //     forbidNonWhitelisted: false, // Allow extra properties
  //     transform: false, // Disable automatic transformation
  //     skipMissingProperties: true, // Skip validation for missing properties
  //     skipNullProperties: true, // Skip validation for null properties
  //     skipUndefinedProperties: true, // Skip validation for undefined properties
  //     transformOptions: {
  //       enableImplicitConversion: false, // Disable implicit conversion
  //     },
  //   }),
  // );

  // Enable CORS for API endpoints
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Configure body parser for all routes
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('USSD School Management System API')
    .setDescription('REST API for the USSD School Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
  console.log(`🚀 USSD School Management System running on port ${port}`);
  console.log(
    `📚 API Documentation available at http://localhost:${port}/api/docs`,
  );
}

void bootstrap();
