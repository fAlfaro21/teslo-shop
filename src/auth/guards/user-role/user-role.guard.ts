//Lo generé con "nest g gu auth/guards/userRole --no-spec"
import { CanActivate, ExecutionContext, Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {

  //Vamos a obtener la metadata para obtener los roles
  constructor(
    private readonly reflector: Reflector //El reflector nos ayuda a mirar la info de decoradores y otra info de la metadata del mismo método
  ){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    //El reflector nos ayuda a mirar la info de decoradores y otra info de la metadata del mismo método
    //...por tanto hacemos un get para obtener los 'roles' que es lo que definí como mi "metadata key" + un target: context.getHandler()
    const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler())
    //console.log({validRoles});

    if(!validRoles ) return true;
    if( validRoles.length === 0 ) return true;

    //Vamos a obtener los roles que tiene el usuario para poderle dar paso o no
    const req = context.switchToHttp().getRequest();  //Obtengo la request que está contenida en el contexto. De aquí saco la info del user (roles) con el que me estoy conectando
    const user = req.user as User;

    if(!user)
      throw new BadRequestException('User not found');

      //console.log({ userRoles: user.roles });

      //Vamos a evaluar cada uno de los roles del usuario, que están en un array (puede tener más de uno)
      for( const role of user.roles ){
        if( validRoles.includes( role )){ //Si encuentra que coincide alguno de los roles del usuario con los del guard, entonces da true
          return true
        }
      }
      
      throw new ForbiddenException(
        `User ${ user.fullName } need a valid rol: [${ validRoles }]`
      );
  }
}
