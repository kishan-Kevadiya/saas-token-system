import { type Namespace, type Server, type Socket } from 'socket.io';
export function generateTokenSocketHandlers(
  nsp: Namespace,
  io: Server,
  socket: Socket
) {
  socket.on('message', async (data, callback) => {
    console.log('data', data);
  });
}
