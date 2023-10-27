import { ExecutionContext, createParamDecorator, InternalServerErrorException } from '@nestjs/common';

//Aquí creamos nuestro propio decorador. Todos los decoradores son funciones
export const GetUser = createParamDecorator( 
    ( data: string, ctx: ExecutionContext) => { //Cuando se llame este decorador, nos va a traer la data y el contexto. La data va a corresopnderse con el argumento que enviemos al invocar el decorador @GetUser
        //console.log({ data });
        const req = ctx.switchToHttp().getRequest();  //Obtengo la request que está contenida en el contexto. De aquí saco la info del user
        const user = req.user;

        if(!user) //Sería un error 500 = error del backend. Daría el error si solicito el usurio y no estoy dentro de una ruta autenticada 
            throw new InternalServerErrorException('User not found (request)')

        return ( !data ) ? user : user[data]; //Si  @GetUser() vacío, sin parámetros, devulevo el "user"...de lo contario ( si @GetUser('email') ) entonces devuelvo el usuario con la propiedad computada de la data, es decir el email
    }

);