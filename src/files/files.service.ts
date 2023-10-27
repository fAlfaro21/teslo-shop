import { join } from 'path';
import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync } from 'fs';

@Injectable()
export class FilesService {
    //A través de este método quiero verificar si mi imagen existe, de lo contrario enviaré un error
    getStaticProductImage( imageName: string ){

        //Path físico de donde se encuentra la imagen en el servidor
        const path = join( __dirname, '../../static/products', imageName );

        console.log(path);
        

        if( !existsSync(path) )
            throw new BadRequestException(`No product found with image ${ imageName}`)

        return path;
    }
  
}
