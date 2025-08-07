import { type Socket } from 'socket.io';

export interface ServerToClientEvents {
  notification: (data: NotificationData) => void;
  userUpdate: (data: UserUpdateData) => void;
  message: (data: MessageData) => void;
  refresh: (data: { token_id: string; message: string }) => void;
}

export interface ClientToServerEvents {
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (data: SendMessageData) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  username: string;
  userData: any;
  rooms: string[];
}

export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export interface NotificationData {
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: Date;
}

export interface UserUpdateData {
  userId: string;
  status: 'online' | 'offline' | 'away';
}

export interface MessageData {
  id: string;
  content: string;
  sender: string;
  room: string;
  timestamp: Date;
}

export interface SendMessageData {
  content: string;
  room: string;
}
