import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from "passport-jwt";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ){

    //Este constructor es para poder hacer funcionar el método validate
    constructor(
        @InjectRepository( User )
        private readonly userRepository: Repository<User>,

        configService: ConfigService
    ){
        //Cuando definimos un constructor, por defecto, el PassportStrategy requiere de llamar al constructor del padre...
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            //Aquí definimos en donde espero recibir el JWT o Token, En este caso vendrá como Bearer Token
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    //Método de validación del payload
    //Este método "validate" se va a llamar si antes:
    //  1. El JWT no ha expirado y
    //  2. Si la firma del JWT hace match con el payload
    async validate( payload: JwtPayload): Promise<User>{

        //const { email } = payload;
        const { id } = payload;

        //vamos a consultar la BBDD para buscar a un usuario con dicho correo o id
        //const user = await this.userRepository.findOneBy({ email });
        const user = await this.userRepository.findOneBy({ id });

        if(!user)
            throw new UnauthorizedException('Token not valid');

        if(!user.isActive)
            throw new UnauthorizedException('User is inactive, contact the Admin');

        //console.log({user});
        

        return user; //Lo que sea que retorne, se va a añadir a la "request"
    }

}