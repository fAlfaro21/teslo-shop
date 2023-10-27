import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

import { Product, ProductImage } from './entities';
import { validate as isUUID } from 'uuid';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductsService {

  //Para el manejo de errores. Llevará el nombre de la clase en la que voy a utilizar el logger
  private readonly logger = new Logger('ProductsService');

  //Vamos a inyectar nuestro repositorio (entidades)
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    //El DataSource sabe cual es la cadena de datos que estoy utilizando, sabe qué usuario utilizo, etc
    private readonly dataSource: DataSource,
  ){}

  async create(createProductDto: CreateProductDto, user: User) {
    
    try {

      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( image => this.productImageRepository.create({ url: image }) ),
        user, //es lo mismo que user: user
      });
      await this.productRepository.save(product);
      return { ...product, images }; //es lo mismo que images:images
      
    } catch (error) {
      //console.log(error);
      this.handleDBExceptions(error);
    }

  }

  async findAll(paginationDto: PaginationDto) {
    
    const { limit=10, offset=0} = paginationDto;
        
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      }
    });
    return products.map(({ images, ...rest }) => ({

      ...rest,
      images: images.map( img => img.url )

    }))
  }

  async findOne(term: string) {
    
    let product: Product;

    //Hubo que instalar el uuid y los tipos: 
    //yarn add uuid
    //yarn add -D @types/uuid
    if( isUUID(term) ){ //Si se trata de un Id, busco por id
      product = await this.productRepository.findOneBy({id:term});
    } else {
      //product = await this.productRepository.findOneBy({slug:term});
      const queryBuilder = this.productRepository.createQueryBuilder('prod'); //se la da un alias a la tabla de productos, por ello lo de prod. Lo vamos a utilizar para el .leftJoinAndSelect
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug',{
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages') //utilizamos el alias de la linea 77 para indicar el punto en el que queremos hacer el leftjoin, y nos pide indicar un nuevo alias a la relación: prodImages
        .getOne();

    }
    
    //const product = await this.productRepository.findOneBy({id});
    if( !product )
      throw new NotFoundException(`Product with id ${term} does not exist`);
  
    return product;
  }

  async findOnePlain( term: string ){
    const { images = [], ...rest } = await this.findOne( term );
    return{
      ...rest,
      images: images.map(  image => image.url )
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const {  images, ...toUpdate } = updateProductDto;
    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });
    if( !product )
      throw new NotFoundException(`Product with id ${id} does not exist`);
    
    //Create query runner, para definir una serie de procedimientos y hasta que no se verifique que se hacen sin problemas, hasta entonces no se actualiza la base de datos.
    const queryRunner = this.dataSource.createQueryRunner();
    //Lo primero es conectar con el query runner
    await queryRunner.connect();
    //Iniciamos  la transacción, así sabe que todo lo que vayamos añadiendo se va a guardar en esta transacción
    await queryRunner.startTransaction();

    try {

      //a efectos del ejercicio: si nos vienen imagenes, vamos a eliminar primero las que ya existen
      if( images ){
        //vamos a eliminar todas las imagenes que coincidan con el id del producto en cuestión
        await queryRunner.manager.delete( ProductImage, { product: { id: id } } )
        //ahora guardamos las nuevas imágenes
        product.images = images.map( 
          image => this.productImageRepository.create({ url: image }) 
        )
      } else {
        // qué pasa si no vienen imágenes?
      }
      //Guardo el usuario que ha actualizado el producto
      product.user = user;
      //Salvo el producto sin hacer el commit e impactar la BBDD
      await queryRunner.manager.save( product );

      //Vamos a hacer el commit e impactar a la BBDD
      await queryRunner.commitTransaction();

      //Desconecto el query runner
      await queryRunner.release();

      //Hacemos así el return para que nos devuleva las imagenes antiguas por la relación (en caso de que no hagamos una modificación de imágenes)
      //si sólo devolvemos el producto, no nos devolvería las imágenes que estaban guardadas (las antiguas)(en caso de que no hagamos una modificación de imágenes)
      return this.findOnePlain( id );
    } catch (error) {

      //Si hay errores durante la transacción a la BBDD, se hace un rollback antes de sacar el error
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    console.log(product);
    
    await this.productRepository.remove(product);
   
  }

  private handleDBExceptions(error: any){

    if(error.code === '23505')
        throw new BadRequestException(error.detail);

      this.logger.error(error)
      throw new InternalServerErrorException('Unexpected error, check server logs');

  }

  //Método para eliminar productos e imágenes (eliminaría todo porque hemos definido un borrado en cascada )
  async deleteAllProducts(){
    //le ponemos el alias 'product'
    const query = this.productRepository.createQueryBuilder( 'product' );

    try {
      
      return await query
        .delete()
        .where({})
        .execute();

    } catch (error) {
      this.handleDBExceptions(error);
    }

  }

}
