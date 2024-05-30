import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  
  constructor(
    @InjectRepository(User) //Para incorporar nuestra entidad que está en otro módulo
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService, //Viene o hace parte del JwtModule, lo necesitamos para generar el jwt
    ){}


  async create(createUserDto: CreateUserDto) {
    
    try {

      const { password, ...userData } = createUserDto;
      
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync( password, 10)
      });

      await this.userRepository.save(user);
      delete user.password;

      return {
        ...user,
        //token: this.getJwtToken( { email: user.email} )
        token: this.getJwtToken( { id: user.id} )
      };
      
    } catch (error) {
      this.handleDBErrors(error);
      
    }

  }

  async login(loginUserDto: LoginUserDto) {
    
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({ 
      where: { email },
      select: { email: true, password: true, id: true }, //sólo selecciona estos atributos
    });

    if (!user)
      throw new UnauthorizedException('Credentials are not valid (email)');

    //Hace una comparación entre la contraseña recién entrada con respecto a la guardada
    if ( !bcrypt.compareSync( password, user.password)) 
      throw new UnauthorizedException('Credentials are not valid (password)');

    return {
      ...user,
      //token: this.getJwtToken( { email: user.email} )
      token: this.getJwtToken( { id: user.id} )
    };
    
  }

  async checkAuthStatus( user: User) {

    return {
      ...user,
      //token: this.getJwtToken( { email: user.email} )
      token: this.getJwtToken( { id: user.id} )
    };

  }
  

  private getJwtToken( payload: JwtPayload ){

    //Vamos a generar el token con el payload (id)
    //el jwtService hace parte del JwtModule (que ya tiene configurado el secreto y el tiempo de expiración)
    const token = this.jwtService.sign( payload );
    return token;

  }

  private handleDBErrors(error:any): never {

    if( error.code === '23505')
      throw new BadRequestException(error.detail)

    console.log(error);
    
    throw new InternalServerErrorException('Please check server logs');

  }
  
}
