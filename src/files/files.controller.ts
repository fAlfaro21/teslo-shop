import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Get, Param, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';

import { fileFilter, fileNamer } from './helpers/index';

@ApiTags('Files-Get and UpLoad')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,  //para tener acceso a las variables de entorno
    ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response, //con @Res estamos bloqueando la respuesta para responder nosotros
    @Param('imageName') imageName: string
  ){
    const path = this.filesService.getStaticProductImage(imageName);

    //Controlo mi respuesta....enviando como respuesta el fichero en el path indicado
    //...así, oculto donde está mi fichero fisicamente
    res.sendFile( path ); //con el res yo puedo decidir mi respuesta
  }

  @Post('product') //esperamos recibir como parámetro algo con tipo fichero
  //Usamos un interceptor: pueden interceptar y validar/mutar las respuestas
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    //limits: { fileSize: 1000 }
    storage: diskStorage({
      destination: './static/products', //donde quiero almacenar mi fichero
      filename: fileNamer
    })
  })) //file corresponde al tipo de archivo que estoy enviando en el postman
  uploadProductImage( 
    @UploadedFile() file: Express.Multer.File,  //esto, gracias a la instalación de @types/multer 
  ){

    if(!file){
      throw new BadRequestException('Make sure the file is an image');
    }

    //const secureUrl = `${ file.filename }`;

    const secureUrl = `${ this.configService.get('HOST_API') }/files/product/${ file.filename }`

    return {
      secureUrl
    };
  }
  
}
