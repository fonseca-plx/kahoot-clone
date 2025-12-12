import { rabbitMQ } from '../src/messaging/rabbitmq';

async function testRabbitMQConnection() {
  console.log('=== Testing RabbitMQ Connection ===\n');
  
  const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://kahoot:kahoot123@localhost:5672';
  
  try {
    // 1. Testar conexão
    console.log('1. Connecting to RabbitMQ...');
    await rabbitMQ.connect(RABBITMQ_URL);
    console.log('✅ Connection successful!\n');
    
    // 2. Testar status
    console.log('2. Checking connection status...');
    const status = rabbitMQ.getConnectionStatus();
    console.log(`✅ Connection status: ${status ? 'Connected' : 'Disconnected'}\n`);
    
    // 3. Testar publicação de evento
    console.log('3. Publishing test event...');
    await rabbitMQ.publishRoomEvent('test-room-123', 'test:event', {
      message: 'Hello RabbitMQ!',
      timestamp: Date.now()
    });
    console.log('✅ Event published successfully!\n');
    
    // 4. Testar subscrição
    console.log('4. Subscribing to test room...');
    const queue = await rabbitMQ.subscribeToRoom('test-room-123', (event, data) => {
      console.log(`📨 Received event: ${event}`);
      console.log(`📦 Data:`, data);
    });
    console.log(`✅ Subscribed to queue: ${queue}\n`);
    
    // 5. Publicar outro evento (deve ser recebido)
    console.log('5. Publishing second event (should be received)...');
    await rabbitMQ.publishRoomEvent('test-room-123', 'player:joined', {
      playerId: 'player-456',
      displayName: 'Test Player'
    });
    
    // Aguardar um pouco para receber mensagem
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✅ Test completed!\n');
    
    // 6. Limpar
    console.log('6. Cleaning up...');
    await rabbitMQ.unsubscribe(queue);
    await rabbitMQ.disconnect();
    console.log('✅ Disconnected successfully!\n');
    
    console.log('=== All tests passed! ===');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testRabbitMQConnection();