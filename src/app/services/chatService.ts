// src/app/services/chatService.ts
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class ChatService {
  private stompClient: Client | null = null;
  private messageCallback: ((message: any) => void) | null = null;
  private readReceiptCallback: ((conversationId: number) => void) | null = null;
  private messageSubscription: StompSubscription | null = null;
  private readSubscription: StompSubscription | null = null;

  connect(token: string, userId: number) {
    console.log('🔍 [chatService] connect() called with:', { token, userId });

    // Avoid opening a second connection if one is already active
    if (this.stompClient?.active) {
      console.log('🔍 [chatService] already active — skipping reconnect');
      return;
    }

    const socket = new SockJS('http://localhost:8080/ws');

    this.stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      onConnect: () => {
        console.log('🔍 [chatService] Connected to WebSocket');

        this.messageSubscription = this.stompClient!.subscribe(
          '/user/queue/messages',
          (message) => {
            const msg = JSON.parse(message.body);
            this.messageCallback?.(msg);
          }
        );

        this.readSubscription = this.stompClient!.subscribe(
          '/user/queue/messages/read',
          (message) => {
            const conversationId = JSON.parse(message.body);
            this.readReceiptCallback?.(conversationId);
          }
        );
      },
      onStompError: (frame) => {
        console.error('🔍 [chatService] STOMP error:', frame);
      },
      onWebSocketError: (event) => {
        console.error('🔍 [chatService] WebSocket-level error:', event);
      },
      onDisconnect: () => {
        console.log('🔍 [chatService] Disconnected');
      }
    });

    console.log('🔍 [chatService] activating STOMP client...');
    this.stompClient.activate();
  }

  disconnect() {
    this.messageSubscription?.unsubscribe();
    this.readSubscription?.unsubscribe();
    this.messageSubscription = null;
    this.readSubscription = null;

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
    this.messageCallback = callback;
  }

  onReadReceipt(callback: (conversationId: number) => void) {
    this.readReceiptCallback = callback;
  }
}

export default new ChatService();