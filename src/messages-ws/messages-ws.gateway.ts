import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces';


//Un gateway es exactamente como un controlador pero con un decorador distinto
//Con esto vamos a poder estar escuchando a clientes que se conectan, acceso al websocket server
//Podríamos probar mirando http://localhost:3000/socket.io/socket.io.js en postman o navegador
//Este es el url que el cliente (web o movil) va a necesitar para conectarse
@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect { //para poder saber cuando un cliente se conecta/desconecta
  
  @WebSocketServer() wss: Server; //Tiene la info de todos los clietnes conectados. Le ponemos como nombre wss
  
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
    ) {}

  async handleConnection(client: Socket) {
    
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload
    //Lo ponemos con un try y un catch porque si da un error la parte de la verificación mostraremos un error para no dejarlo pasar
    try {
      //Verficamos el JWT
      payload = this.jwtService.verify( token );
      //Si el JWT es correcto, voy a ejecutar este método
      //Ws = WebSocket
      await this.messagesWsService.registerClient( client, payload.id );
    } catch (error) {
      //Si hay error simplemente desconecto al cliente
      client.disconnect();
      return;
    }

    //console.log({payload});
    
    //Para notificar cuantos clientes están conectados
    //console.log( { conectados: this.messagesWsService.getConnectedClients() });
    
    //clients-update es el evento que voy a emitir
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients()) 
    
  }
  handleDisconnect(client: Socket) {
    //Cuando un cliente se desconecte voy a ejecutar este método
    //console.log('Cliente desconectado: ', client.id);
    this.messagesWsService.removeClient( client.id );

    //Para reportar la desconexión de un cliente
    //console.log( { desconectados: this.messagesWsService.getConnectedClients() });

    //clients-update es el evento que voy a emitir junto con el array de clientes conectados
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
  }

  //Decorador para escuchar el evento message-from-client
  @SubscribeMessage('message-from-client')
  //..con el subscribeMessage tenemos acceso al cliente (que es el socket que está emitiendo el evento) y el payload
  onMessageFromClient( client: Socket, payload: NewMessageDto){
    
    //Para emitir únicamente al cliente, no a todos
    /* client.emit('message-from-server', {
      fullName: 'Soy yo!',
      message: payload.message || 'no-message!!',
    }); */

    //Para emitir a todos menos al cliente que ha enviado el mensaje
      /* client.broadcast.emit('message-from-server', {
      fullName: 'Soy yo!',
      message: payload.message || 'no-message!!',
      }) */

    //Para emitir a todos
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'no-message!!',
    });
  }
}
