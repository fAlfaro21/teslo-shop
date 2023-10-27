import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

import { Product, ProductImage } from './entities';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    //Para reflejarlo como tabla en la BBDD
    TypeOrmModule.forFeature([ Product, ProductImage ]), //Lleva el nombre de la entidad
    AuthModule
  ],
  exports: [
    ProductsService,
    TypeOrmModule //en el caso que de quiera trabajar en otro módulo con las entidades Product y ProductImage
  ],
})
export class ProductsModule {}
