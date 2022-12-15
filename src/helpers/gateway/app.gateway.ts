import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { LoggerService } from '../../shared/providers/logger.service';

// implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway {
  constructor(private logger: LoggerService) {}

  @WebSocketServer()
  server: Server;

  /**
   * @description Initializes the web socket and saved in logs
   */
  afterInit() {
    this.logger.info(`WebSocket Initialized`);
  }

  /**
   * @description Triggered when socket is disconnected. This logs the client id which is disconnected
   * @param client - Client info
   */
  handleDisconnect(client: Socket) {
    this.logger.info(`WebSocket Client disconnected: ${client.id}`);
  }

  /**
   * @description This logs client id which is connected
   * @param client - Client info
   * @param args any
   */
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.info(`WebSocket Client connected: ${client.id}`, args);
  }

  /**
   * @description This is common function from where events are triggered to FE client
   * @param eventName -Eventname which needs to be triggered
   * @param payload - Data which needs to  be sent in socket
   * @param userId - UserId to whom the event is triggered
   */
  triggerEvent(eventName: string, payload: any, userId: string) {
    this.logger.info(`Socket event ${eventName} is triggered to ${userId}`);
    this.server.emit(eventName, payload);
  }
}
