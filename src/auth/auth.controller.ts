import { Controller, Get, Post, Body, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

import { IncomingHttpHeaders } from 'http';

import { AuthService } from './auth.service';
import { Auth, GetUser, RawHeaders, RoleProtected } from './decorators';

import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user:User
    //@GetUser('id') id:String   también podría ser así
  ){
    return this.authService.checkAuthStatus( user )
  }

  @Get('private')
  @UseGuards( AuthGuard() ) //Esto es para securizar nuestro endpoint, aplica la verificación del JWT
  testingPrivateRoute(
    @Req() request: Express.Request, //Extrae de la request, la request
    //Con este decorador que hemos hecho, recuperaremos los datos del usuario
    @GetUser() user: User,  //Decoro una propiedad llamada "user" de tipo "User", para devolverla en el return (*). Este GetUser va a devolver lo que dicte el GetUser (ver get-user.decorator.ts)
    @GetUser('email') userEmail: string,  //Aquí estoy enviando como argumento la data "email" a mi decorador @GetUser. Si envío varios argumentos, deberían ir en formato array. Ojo: También podría incorporar el uso de los pipes.
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
    ){
    //console.log( request );
    
    return {
      ok: true,
      message: 'Hola Mundo Private',
      user, //(*) Se devuelve gracias al decorador @GetUser
      userEmail,
      rawHeaders,
      headers
    }
  }

  @Get('private2')
  //@SetMetadata('roles', ['admin', 'super-user']) //Para el manejo de los roles, Esto trabajará con nuestro custom guard
  //Creamos este custom decorator para no utilizar el @SetMetadata que es volátil y se usa poco
  @RoleProtected( ValidRoles.superUser, ValidRoles.admin, ValidRoles.user )
  @UseGuards( AuthGuard(), UserRoleGuard ) //Este guard establece el usuario en los headers, sin esto no hay usuario
  privateRoute2(
    @GetUser() user:User
  ){
    return {
      ok: true,
      user
    }
  }

  //Este custom decorator es el más óptimo, puest tendremos 1 unico decorador para manejar los roles
  @Get('private3')
  @Auth(ValidRoles.admin, ValidRoles.superUser) //Si el parentesis va vacío, no validaría ningún rol...unicamente el resto de validaciones (si es activo el usuario o si ha expirado el password, por ejemplo)
  privateRoute3(
    @GetUser() user:User
  ){
    return {
      ok: true,
      user
    }
  }
  
}
