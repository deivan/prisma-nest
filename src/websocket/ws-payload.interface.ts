export interface JoinRoomPayload {
  room: string;
}

export interface SendMessagePayload {
  room: string;
  message: string;
}

export interface BroadcastMessage {
  senderId: string;
  message: string;
  timestamp: string;
}
