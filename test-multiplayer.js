/**
 * TESTES DO MULTIPLAYER V2
 * 
 * Copie e cole no Console (F12) para testar
 */

// ========================================
// TESTE 1: Verificar Firebase
// ========================================

function testFirebase() {
  console.log('🧪 TESTE 1: Firebase Conectado?');
  console.log('-'.repeat(40));
  
  if (window.firebaseSetup) {
    console.log('✅ firebaseSetup carregado');
    
    if (window.firebaseSetup.isFirebaseConnected()) {
      console.log('✅ Firebase conectado com sucesso!');
      console.log('📊 Database:', window.database);
    } else {
      console.log('⚠️ Firebase não conectado - Modo OFFLINE');
      console.log('💡 Dica: Configure firebaseSetup.js com credenciais reais');
    }
  } else {
    console.log('❌ firebaseSetup não carregado');
  }
}

// ========================================
// TESTE 2: Verificar MultiplayerV2
// ========================================

function testMultiplayerV2() {
  console.log('\n🧪 TESTE 2: MultiplayerV2 Carregado?');
  console.log('-'.repeat(40));
  
  if (window.multiplayerManager) {
    console.log('✅ multiplayerManager carregado');
    console.log('👤 Jogador:', window.multiplayerManager.playerName);
    console.log('🆔 ID:', window.multiplayerManager.playerId);
    console.log('🔌 Status:', window.multiplayerManager.connectionStatus);
    
    const status = window.multiplayerManager.getRoomStatus();
    console.log('📌 Sala atual:', status);
  } else {
    console.log('⚠️ multiplayerManager ainda não inicializado');
    console.log('💡 Aguarde 2s quando página carrega...');
  }
}

// ========================================
// TESTE 3: Criar Sala
// ========================================

async function testCreateRoom() {
  console.log('\n🧪 TESTE 3: Criar Sala');
  console.log('-'.repeat(40));
  
  if (!window.multiplayerManager) {
    console.log('❌ MultiplayerManager não disponível');
    return;
  }

  try {
    const roomCode = await window.multiplayerManager.createRoom('Sala Teste', '1v1');
    
    if (roomCode) {
      console.log('✅ Sala criada com sucesso!');
      console.log('📍 Código:', roomCode);
      console.log('🏠 Host:', true);
      console.log('🔗 Compartilhe este código com outro jogador');
    } else {
      console.log('❌ Falha ao criar sala');
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// ========================================
// TESTE 4: Entrar em Sala
// ========================================

async function testJoinRoom(roomCode) {
  console.log(`\n🧪 TESTE 4: Entrar em Sala ${roomCode}`);
  console.log('-'.repeat(40));
  
  if (!window.multiplayerManager) {
    console.log('❌ MultiplayerManager não disponível');
    return;
  }

  try {
    const success = await window.multiplayerManager.joinRoom(roomCode);
    
    if (success) {
      console.log('✅ Entrou na sala com sucesso!');
      console.log('🏠 Host:', false);
      console.log('👥 Aguardando pelo host...');
    } else {
      console.log('❌ Falha ao entrar na sala');
      console.log('💡 Verique: código correto? sala existe? sala cheia?');
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// ========================================
// TESTE 5: Enviar Mensagem Chat
// ========================================

async function testChatMessage(message) {
  console.log(`\n🧪 TESTE 5: Enviar Mensagem "${message}"`);
  console.log('-'.repeat(40));
  
  if (!window.multiplayerManager || !window.multiplayerManager.currentRoom) {
    console.log('❌ Não está em uma sala');
    return;
  }

  try {
    await window.multiplayerManager.sendChatMessage(message);
    console.log('✅ Mensagem enviada!');
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// ========================================
// TESTE 6: Status da Conexão
// ========================================

function testConnectionStatus() {
  console.log('\n🧪 TESTE 6: Status da Conexão');
  console.log('-'.repeat(40));
  
  if (!window.multiplayerManager) {
    console.log('❌ MultiplayerManager não disponível');
    return;
  }

  const status = window.multiplayerManager.connectionStatus;
  const roomStatus = window.multiplayerManager.getRoomStatus();
  
  console.log('Conexão:', status === 'connected' ? '🟢 Conectado' : '🔴 Desconectado');
  console.log('Sala:', roomStatus.code || 'Nenhuma');
  console.log('Jogadores:', `${roomStatus.players}/${roomStatus.maxPlayers}`);
  console.log('Você é:', roomStatus.isHost ? '👑 Host' : '👤 Cliente');
}

// ========================================
// TESTE 7: Dados da Sala
// ========================================

function testRoomData() {
  console.log('\n🧪 TESTE 7: Dados da Sala');
  console.log('-'.repeat(40));
  
  if (!window.multiplayerManager || !window.multiplayerManager.currentRoom) {
    console.log('❌ Não está em uma sala');
    return;
  }

  const room = window.multiplayerManager.currentRoom;
  console.log('Código:', room.code);
  console.log('Nome:', room.name);
  console.log('Status:', room.status);
  console.log('Jogadores:');
  for (let pid in room.players) {
    const p = room.players[pid];
    console.log(`  - ${p.name} (${p.id}) ${p.connected ? '✅' : '❌'}`);
  }
}

// ========================================
// TESTE 8: Monitor de Sincronização
// ========================================

function testSyncMonitor() {
  console.log('\n🧪 TESTE 8: Monitor de Sincronização');
  console.log('-'.repeat(40));
  console.log('⏱️ Monitorando sincronização por 10 segundos...');
  
  let count = 0;
  const interval = setInterval(() => {
    count++;
    
    if (window.multiplayerManager?.currentRoom?.gameState?.balls) {
      const ballCount = Object.keys(window.multiplayerManager.currentRoom.gameState.balls).length;
      console.log(`[${count}s] Bolas sincronizadas: ${ballCount}`);
    }
    
    if (count >= 10) {
      clearInterval(interval);
      console.log('✅ Monitor finalizado');
    }
  }, 1000);
}

// ========================================
// TESTE 9: Verificar Anti-Desync
// ========================================

function testAntiDesync() {
  console.log('\n🧪 TESTE 9: Sistema Anti-Desync');
  console.log('-'.repeat(40));
  
  if (!window.multiplayerManager) {
    console.log('❌ MultiplayerManager não disponível');
    return;
  }

  const state = window.multiplayerManager.lastValidState;
  
  if (state) {
    console.log('✅ Último estado válido:');
    console.log('  Turno:', state.currentTurn);
    console.log('  Ativo:', state.active);
    console.log('  Timestamp:', new Date(state.updatedAt).toLocaleTimeString());
  } else {
    console.log('⚠️ Nenhum estado salvo ainda');
  }
}

// ========================================
// TESTE 10: Simulação Completa
// ========================================

async function testFullScenario() {
  console.log('\n🧪 TESTE 10: Simulação Completa');
  console.log('-'.repeat(40));
  console.log('Executando sequência de testes...\n');
  
  testFirebase();
  await new Promise(r => setTimeout(r, 1000));
  
  testMultiplayerV2();
  await new Promise(r => setTimeout(r, 1000));
  
  testConnectionStatus();
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('\n✅ Testes iniciais completados!');
  console.log('\n📋 Próximos passos:');
  console.log('1. testCreateRoom() - Cria uma sala');
  console.log('2. Copiar código e abrir em outro navegador');
  console.log('3. testJoinRoom("CODIGO") - Outro navegador entra');
  console.log('4. testChatMessage("Olá!") - Testar chat');
  console.log('5. testRoomData() - Ver dados atualizados');
}

// ========================================
// MENU RÁPIDO
// ========================================

function testMenu() {
  console.log(`
╔════════════════════════════════════════╗
║   TESTES DO NEON POOL v2.0 MULTIPLAYER  ║
╚════════════════════════════════════════╝

TESTES BÁSICOS:
  testFirebase()          - Verificar Firebase
  testMultiplayerV2()     - Verificar Multiplayer
  testConnectionStatus()  - Ver status da conexão

TESTES DE SALA:
  testCreateRoom()        - Criar uma sala  
  testJoinRoom("CODE")    - Entrar em uma sala
  testRoomData()          - Ver dados da sala

TESTES AVANÇADOS:
  testChatMessage("msg")  - Enviar mensagem chat
  testAntiDesync()        - Verificar anti-desync
  testSyncMonitor()       - Monitorar sincronização

COMPLETO:
  testFullScenario()      - Rodar todos os testes

`) 
}

// Mostrar menu ao carregar
console.log('%c🎱 Bem-vindo ao Neon Pool Test Console!', 'color: #00ff88; font-size: 16px; font-weight: bold;');
console.log('%cDigite: testMenu()', 'color: #00ff88;');
testMenu();

// Exportar funções para global
window.testFirebase = testFirebase;
window.testMultiplayerV2 = testMultiplayerV2;
window.testCreateRoom = testCreateRoom;
window.testJoinRoom = testJoinRoom;
window.testChatMessage = testChatMessage;
window.testConnectionStatus = testConnectionStatus;
window.testRoomData = testRoomData;
window.testSyncMonitor = testSyncMonitor;
window.testAntiDesync = testAntiDesync;
window.testFullScenario = testFullScenario;
window.testMenu = testMenu;
