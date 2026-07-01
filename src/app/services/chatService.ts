// services/chatService.ts
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class ChatService {
  private stompClient: Client | null = null;
  private messageCallbacks: ((message: any) => void)[] = [];
  private readReceiptCallbacks: ((conversationId: number) => void)[] = [];

  connect(token: string, userId: number) {
    const socket = new SockJS('http://localhost:8080/ws');

    this.stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      onConnect: () => {
        console.log('Connected to WebSocket');

        // Subscribe to user's queue for messages
        this.stompClient?.subscribe(`/user/${userId}/queue/messages`, (message) => {
          const msg = JSON.parse(message.body);
          this.messageCallbacks.forEach(callback => callback(msg));
        });

        // Subscribe to read receipts
        this.stompClient?.subscribe(`/user/${userId}/queue/messages/read`, (message) => {
          const conversationId = JSON.parse(message.body);
          this.readReceiptCallbacks.forEach(callback => callback(conversationId));
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      }
    });

    this.stompClient.activate();
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }

  sendMessage(conversationId: number, message: any) {
    if (this.stompClient?.connected) {
      this.stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(message)
      });
    }
  }

  onMessage(callback: (message: any) => void) {
    this.messageCallbacks.push(callback);
  }

  onReadReceipt(callback: (conversationId: number) => void) {
    this.readReceiptCallbacks.push(callback);
  }
}

export default new ChatService();