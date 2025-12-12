import amqp from 'amqplib';

interface GameEvent {
  event: string;
  data: any;
  roomId: string;
  timestamp: number;
}

type Connection = amqp.Connection;
type Channel = amqp.Channel;
type ConsumeMessage = amqp.ConsumeMessage;

export class RabbitMQService {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private isConnected: boolean = false;
  
  private readonly exchanges = {
    ROOM_EVENTS: 'kahoot.room.events',
    GAME_EVENTS: 'kahoot.game.events',
  };

  async connect(url: string): Promise<void> {
    try {
      console.log('[RabbitMQ] Connecting to:', url);
      
      const conn = await amqp.connect(url);
      const ch = await conn.createChannel();
      
      await ch.assertExchange(
        this.exchanges.ROOM_EVENTS, 
        'topic', 
        { durable: true }
      );
      
      await ch.assertExchange(
        this.exchanges.GAME_EVENTS, 
        'fanout', 
        { durable: false }
      );
      
      conn.on('error', (err: Error) => {
        console.error('[RabbitMQ] Connection error:', err);
        this.isConnected = false;
      });
      
      conn.on('close', () => {
        console.log('[RabbitMQ] Connection closed');
        this.isConnected = false;
      });
      
      this.connection = conn as any;
      this.channel = ch;
      this.isConnected = true;
      console.log('[RabbitMQ] Connected successfully');
    } catch (error) {
      console.error('[RabbitMQ] Connection failed:', error);
      throw error;
    }
  }

  async publishRoomEvent(roomId: string, event: string, data: any): Promise<void> {
    if (!this.isConnected || !this.channel) {
      console.warn('[RabbitMQ] Not connected, skipping publish');
      return;
    }
    
    try {
      const routingKey = `room.${roomId}.${event}`;
      const message: GameEvent = {
        event,
        data,
        roomId,
        timestamp: Date.now()
      };
      
      this.channel.publish(
        this.exchanges.ROOM_EVENTS,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { 
          persistent: false,
          contentType: 'application/json'
        }
      );
      
      console.log(`[RabbitMQ] Published: ${routingKey}`);
    } catch (error) {
      console.error('[RabbitMQ] Publish error:', error);
    }
  }

  async subscribeToRoom(
    roomId: string, 
    callback: (event: string, data: any) => void
  ): Promise<string> {
    if (!this.isConnected || !this.channel) {
      throw new Error('RabbitMQ not connected');
    }
    
    const channel = this.channel;
    
    try {
      const { queue } = await channel.assertQueue('', { 
        exclusive: true,
        autoDelete: true,
        durable: false
      });
      
      const pattern = `room.${roomId}.*`;
      await channel.bindQueue(
        queue,
        this.exchanges.ROOM_EVENTS,
        pattern
      );
      
      console.log(`[RabbitMQ] Subscribed to room ${roomId} (queue: ${queue})`);
      
      await channel.consume(
        queue, 
        (msg: ConsumeMessage | null) => {
          if (!msg) return;
          
          try {
            const gameEvent: GameEvent = JSON.parse(msg.content.toString());
            callback(gameEvent.event, gameEvent.data);
            channel.ack(msg);
          } catch (error) {
            console.error('[RabbitMQ] Message processing error:', error);
            channel.nack(msg, false, false);
          }
        },
        { noAck: false }
      );
      
      return queue;
    } catch (error) {
      console.error('[RabbitMQ] Subscribe error:', error);
      throw error;
    }
  }

  async unsubscribe(queueName: string): Promise<void> {
    if (!this.channel) return;
    
    try {
      await this.channel.deleteQueue(queueName);
      console.log(`[RabbitMQ] Unsubscribed from queue: ${queueName}`);
    } catch (error) {
      console.error('[RabbitMQ] Unsubscribe error:', error);
    }
  }

  async publishGlobalEvent(event: string, data: any): Promise<void> {
    if (!this.isConnected || !this.channel) {
      console.warn('[RabbitMQ] Not connected, skipping global publish');
      return;
    }
    
    try {
      const message = {
        event,
        data,
        timestamp: Date.now()
      };
      
      this.channel.publish(
        this.exchanges.GAME_EVENTS,
        '',
        Buffer.from(JSON.stringify(message)),
        { 
          persistent: false,
          contentType: 'application/json'
        }
      );
      
      console.log(`[RabbitMQ] Global event published: ${event}`);
    } catch (error) {
      console.error('[RabbitMQ] Global publish error:', error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await (this.connection as any).close();
      }
      this.isConnected = false;
      console.log('[RabbitMQ] Disconnected');
    } catch (error) {
      console.error('[RabbitMQ] Disconnect error:', error);
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const rabbitMQ = new RabbitMQService();
