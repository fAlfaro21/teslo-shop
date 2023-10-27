import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap')

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, 
    })
  );

  const config = new DocumentBuilder()
    .setTitle('Teslo RESTFul API')
    .setDescription('Teslo shop endpoints')
    .setVersion('1.0')
    //.addTag('cats') //Es un agrupador
    .build();
  const document = SwaggerModule.createDocument(app, config); //puedo cambiar, tema, colores, etc
  SwaggerModule.setup('api', app, document); // se crea en el endpoint api, va a envial la app y nuestro docto

  await app.listen(process.env.PORT);
  logger.log(`App running on port ${process.env.PORT}`);
  
}
bootstrap();
