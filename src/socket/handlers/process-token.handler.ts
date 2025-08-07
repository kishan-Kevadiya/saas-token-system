import { type Namespace, type Server, type Socket } from 'socket.io';
import JoinRoomController from '@/modules/process-token/join-room/join-room.controller';

export function processTokenSocketHandlers(
  nsp: Namespace,
  io: Server,
  socket: Socket
) {
  const controller = new JoinRoomController(socket, nsp);
  socket.on('join-room', async (data, callback) => {
    await controller.joinRoom(data, callback);
  });
}

