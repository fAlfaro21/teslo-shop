import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    ConfigModule,
    //Para reflejarlo como tabla en la BBDD
    TypeOrmModule.forFeature([ User ]), //Lleva el nombre de la entidad que vamos a estar manejando en este módulo
    PassportModule.register({ //Indico modo de autenticación que quiero, es decir, cómo evaluar el métido de acceso: JWT
      defaultStrategy: 'jwt',
    }),
    //Para un registro asíncrono, para asegurarme de que el módulo se monte cuando ya tenga definido el JWT_SECRET (o incluso, el resto de los valores de las variables de entorno)
    JwtModule.registerAsync({
      imports: [ ConfigModule ], //Importo esto que luego...
      inject: [ ConfigService ], //...me va a permitir injectar mi ConfigService
      useFactory: ( configService: ConfigService ) => { //es la función que se va a llamar cuando se intente registrar de manera asíncrona el módulo
        
        //console.log('JWT Secret ', configService.get('JWT_SECRET'));
        //console.log('JWT SECRET ', process.env.JWT_SECRET);
        
        return{
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '2h',
          }
        }
      }})
    /* JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '2h',
      }
    }) */
  ],
  exports: [
    TypeOrmModule, //en el caso que de quiera trabajar en otro módulo con la entidad User
    JwtStrategy,
    PassportModule,
    JwtModule
  ],
})
export class AuthModule {}
