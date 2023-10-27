import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const RawHeaders = createParamDecorator( 
    ( data: string, ctx: ExecutionContext) => { //Cuando se llame este decorador, nos va a traer la data y el contexto. La data va a corresopnderse con el argumento que enviemos al invocar el decorador @GetUser
        const req = ctx.switchToHttp().getRequest();  //Obtengo la request que está contenida en el contexto. De aquí saco la info del user
        const rawHeaders = req.rawHeaders;
        return rawHeaders
    }

);