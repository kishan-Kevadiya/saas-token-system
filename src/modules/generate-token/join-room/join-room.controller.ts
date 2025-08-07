import { type Socket, type Namespace } from 'socket.io';
import JoinRoomService from './join-room.service';

export default class JoinRoomController {
  private readonly joinRoomService: JoinRoomService;

  constructor(
    private readonly socket: Socket,
    private readonly namespace?: Namespace,
    joinRoomService?: JoinRoomService
  ) {
    this.joinRoomService = joinRoomService ?? new JoinRoomService();
  }

  public joinRoom = async (
    data: any,
    callback?: (error: any, result: any) => void
  ) => {
    try {
      const series = await this.joinRoomService.getCouterService(
        data.counter_id
      );
      for (const id of series.series_ids) {
        const roomId = `company:${String(series.company_id)}:series:${String(id)}`;

        await this.socket.join(roomId);
      }

      if (callback) {
        callback(null, {
          success: true,
          message: 'Successfully joined rooms',
          roomsJoined: series.series_ids.map(
            (id) => `company:${String(series.company_id)}:series:${String(id)}`
          ),
        });
      }
    } catch (error: any) {
      console.error('Error joining room:', error);

      if (callback) {
        callback(
          {
            success: false,
            error: error.message,
          },
          null
        );
      }
    }
  };
}
