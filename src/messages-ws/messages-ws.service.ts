import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Socket } from 'socket.io';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnectedClients {
    //Vamos a tener la relación de todos los usuarios con un objeto socket/user
    //Vamos a tener que el id del socket va a apuntar a un objeto con socket y User
    [ id: string ]: {
        socket: Socket,
        user: User,
    }
}

@Injectable()
export class MessagesWsService {

    private connectedClients: ConnectedClients = {}

    constructor(
        @InjectRepository( User ) //Para hacer uso del repositorio (y de la entidad User)
        private readonly userRepository: Repository<User>
    ){}

    //Cuando un cliente se conecte voy a ejecutar este método
    async registerClient( client: Socket, userId: string ){
        //Vamos a verificar/buscar el usuario en el repo
        const user = await this.userRepository.findOneBy({ id: userId })
        if( !user ) throw new Error('User not found');
        if( !user.isActive ) throw new Error('User not Active');

        this.checkUserConnection( user );

        //Así pues, cuando el cliente se conecta voy a llamar a connectedClients con el client.id, y va a apuntar al objeto socket/user
        this.connectedClients[client.id] = {
            socket: client,
            user: user};
    }

    removeClient( clientId: string ){
        //Para eliminar el cliente
        delete this.connectedClients[clientId]
    }

    //Con esto envío los ids de los clientes conectados
    getConnectedClients(): string[] { 
        //console.log(this.connectedClients);
        return Object.keys( this.connectedClients );
    }

    getUserFullName( socketId: string) {
        return this.connectedClients[socketId].user.fullName;
    }

    private checkUserConnection( user: User ){
        for( const clientId of Object.keys( this.connectedClients )){
            const connectedClient = this.connectedClients[ clientId ];
            if( connectedClient.user.id === user.id ){
                connectedClient.socket.disconnect(); //Desconecta a aquel usuario conectado que es igual al que se acaba de conectar
                break; //Si ya encontramos al usuario, no hay necesidad de seguir buscando
            }
        }
    }
}
