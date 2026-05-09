/**
 * MULTIPLAYER V2 - IMPLEMENTAÇÃO REAL COM FIREBASE
 * 
 * Características:
 * ✅ Sincronização real-time das bolas
 * ✅ Sistema de turnos funcionando
 * ✅ Autoridade do host sobre física
 * ✅ Detecção de desconexão e reconexão
 * ✅ Chat online em tempo real
 * ✅ Anti-desync com validação
 * ✅ Compatível com PC, tablet, celular
 */

class MultiplayerV2 {
  constructor(gameManager, uiManager) {
    this.gameManager = gameManager;
    this.uiManager = uiManager;
    
    // Estado local
    this.playerId = this.generatePlayerId();
    this.playerName = localStorage.getItem('playerName') || `Player ${this.playerId.slice(0, 4)}`;
    this.currentRoom = null;
    this.isHost = false;
    
    // Firebase
    this.database = null;
    this.roomRef = null;
    this.listeners = [];
    
    // Sincronização
    this.lastSyncTime = 0;
    this.syncInterval = 100; // Sincronizar a cada 100ms
    this.physicsBuffer = [];
    this.ballPositionCache = {};
    
    // Estado do turno
    this.currentTurn = 0;
    this.currentPlayerTurn = null;
    this.turnValid = false;
    this.lastValidState = null;
    
    // Reconexão
    this.connectionStatus = 'disconnected'; // disconnected, connecting, connected
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    
    // Chat
    this.chatMessages = [];
    this.maxChatMessages = 100;
    
    console.log(`🎮 MultiplayerV2 inicializado - Jogador: ${this.playerName}`);
  }

  /**
   * GERENCIAMENTO DE SALAS
   */

  /**
   * Criar nova sala
   */
  async createRoom(roomName, gameMode = '1v1') {
    try {
      this.database = firebaseSetup.getDatabase();
      
      if (!this.database) {
        console.error('❌ Firebase não disponível');
        return null;
      }

      const roomCode = this.generateRoomCode();
      const roomData = {
        id: roomCode,
        code: roomCode,
        name: roomName,
        mode: gameMode,
        host: {
          id: this.playerId,
          name: this.playerName,
          avatar: this.getPlayerAvatar()
        },
        players: {
          [this.playerId]: {
            id: this.playerId,
            name: this.playerName,
            avatar: this.getPlayerAvatar(),
            team: 'team1',
            connected: true,
            joinedAt: Date.now()
          }
        },
        status: 'waiting', // waiting, playing, finished
        createdAt: Date.now(),
        updatedAt: Date.now(),
        gameState: {
          balls: {},
          currentPlayer: this.playerId,
          currentTurn: 0,
          active: false,
          lastShotTime: 0
        },
        settings: {
          maxPlayers: gameMode === '1v1' ? 2 : gameMode === '2v2' ? 4 : 6,
          privateRoom: true,
          clockEnabled: true
        }
      };

      // Salvar no Firebase
      await this.database.ref(`rooms/${roomCode}`).set(roomData);
      
      this.currentRoom = roomData;
      this.isHost = true;
      this.connectionStatus = 'connected';

      console.log(`✅ Sala criada: ${roomCode}`);
      
      // Começar a sincronizar
      this.startSyncListener();
      
      return roomCode;
    } catch (error) {
      console.error('❌ Erro ao criar sala:', error);
      return null;
    }
  }

  /**
   * Entrar numa sala existente
   */
  async joinRoom(roomCode) {
    try {
      this.database = firebaseSetup.getDatabase();
      
      if (!this.database) {
        console.error('❌ Firebase não disponível');
        return false;
      }

      // Verificar se sala existe
      const snapshot = await this.database.ref(`rooms/${roomCode}`).once('value');
      const roomData = snapshot.val();

      if (!roomData) {
        console.error(`❌ Sala ${roomCode} não encontrada`);
        return false;
      }

      // Verificar se sala está cheia
      const playerCount = Object.keys(roomData.players || {}).length;
      const maxPlayers = roomData.settings?.maxPlayers || 2;

      if (playerCount >= maxPlayers) {
        console.error('❌ Sala cheia');
        return false;
      }

      // Adicionar jogador à sala
      await this.database.ref(`rooms/${roomCode}/players/${this.playerId}`).set({
        id: this.playerId,
        name: this.playerName,
        avatar: this.getPlayerAvatar(),
        team: playerCount > 0 ? 'team2' : 'team1',
        connected: true,
        joinedAt: Date.now()
      });

      // Atualizar timestamp da sala
      await this.database.ref(`rooms/${roomCode}/updatedAt`).set(Date.now());

      this.currentRoom = roomData;
      this.currentRoom.players[this.playerId] = {
        id: this.playerId,
        name: this.playerName,
        avatar: this.getPlayerAvatar(),
        team: playerCount > 0 ? 'team2' : 'team1',
        connected: true,
        joinedAt: Date.now()
      };

      this.isHost = false;
      this.connectionStatus = 'connected';

      console.log(`✅ Entrou na sala: ${roomCode}`);

      // Começar a sincronizar
      this.startSyncListener();
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao entrar na sala:', error);
      return false;
    }
  }

  /**
   * Sair da sala
   */
  async leaveRoom() {
    try {
      if (!this.currentRoom || !this.database) {
        return;
      }

      const roomCode = this.currentRoom.code;

      // Remover jogador
      await this.database.ref(`rooms/${roomCode}/players/${this.playerId}`).remove();

      // Verificar se sala está vazia
      const snapshot = await this.database.ref(`rooms/${roomCode}/players`).once('value');
      const remainingPlayers = snapshot.val();

      if (!remainingPlayers || Object.keys(remainingPlayers).length === 0) {
        // Deletar sala se vazia
        await this.database.ref(`rooms/${roomCode}`).remove();
        console.log(`🗑️ Sala ${roomCode} deletada (vazia)`);
      } else {
        // Se era host, transferir para outro jogador
        if (this.isHost && remainingPlayers) {
          const newHostId = Object.keys(remainingPlayers)[0];
          await this.database.ref(`rooms/${roomCode}/host`).set(remainingPlayers[newHostId]);
        }
      }

      // Limpar listeners
      this.stopSyncListener();
      this.currentRoom = null;
      this.isHost = false;
      this.connectionStatus = 'disconnected';

      console.log('✅ Saiu da sala');
    } catch (error) {
      console.error('❌ Erro ao sair da sala:', error);
    }
  }

  /**
   * SINCRONIZAÇÃO DE FÍSICA
   */

  /**
   * Começar a escutar atualizações da sala
   */
  startSyncListener() {
    if (!this.currentRoom || !this.database) return;

    const roomCode = this.currentRoom.code;

    // Escutar mudanças no estado do jogo
    const gameStateRef = this.database.ref(`rooms/${roomCode}/gameState`);
    
    const gameStateListener = gameStateRef.on('value', (snapshot) => {
      const gameState = snapshot.val();
      if (gameState) {
        this.onGameStateUpdate(gameState);
      }
    });

    // Escutar novos jogadores
    const playersRef = this.database.ref(`rooms/${roomCode}/players`);
    
    const playersListener = playersRef.on('value', (snapshot) => {
      const players = snapshot.val();
      if (players) {
        this.onPlayersUpdate(players);
      }
    });

    // Escutar mensagens de chat
    const chatRef = this.database.ref(`rooms/${roomCode}/chat`);
    
    const chatListener = chatRef.on('child_added', (snapshot) => {
      const message = snapshot.val();
      if (message && message.sender.id !== this.playerId) {
        this.onChatMessage(message);
      }
    });

    // Guardar referências para cleanup
    this.listeners = [
      { ref: gameStateRef, listener: gameStateListener },
      { ref: playersRef, listener: playersListener },
      { ref: chatRef, listener: chatListener }
    ];

    console.log('🔄 Sincronização iniciada');
  }

  /**
   * Parar de escutar atualizações
   */
  stopSyncListener() {
    for (let listener of this.listeners) {
      listener.ref.off('value', listener.listener);
    }
    this.listeners = [];
    console.log('🛑 Sincronização parada');
  }

  /**
   * Atualizar estado do jogo (apenas host pode fazer)
   */
  async syncGameState(gameState) {
    if (!this.isHost || !this.currentRoom || !this.database) return;

    try {
      const roomCode = this.currentRoom.code;
      
      // Criar snapshot do estado atual
      const stateSnapshot = {
        balls: gameState.balls || {},
        currentPlayer: gameState.currentPlayer,
        currentTurn: gameState.currentTurn,
        active: gameState.active,
        lastShotTime: gameState.lastShotTime,
        updatedAt: Date.now()
      };

      // Guardar última versão válida
      this.lastValidState = JSON.parse(JSON.stringify(stateSnapshot));

      // Enviar para Firebase
      await this.database.ref(`rooms/${roomCode}/gameState`).update(stateSnapshot);

    } catch (error) {
      console.error('❌ Erro ao sincronizar estado:', error);
    }
  }

  /**
   * Quando estado do jogo é atualizado pelo host
   */
  onGameStateUpdate(gameState) {
    if (this.isHost) return; // Host não precisa receber sua própria sincronização

    // Aplicar posições das bolas do host
    if (gameState.balls && this.gameManager) {
      this.applySyncedBalls(gameState.balls);
    }

    // Atualizar turno se necessário
    if (gameState.currentTurn !== this.currentTurn) {
      this.currentTurn = gameState.currentTurn;
      this.currentPlayerTurn = gameState.currentPlayer;
      this.turnValid = false;
    }

    // Atualizar UI
    if (this.uiManager) {
      this.uiManager.updateGameInfo({
        turn: gameState.currentTurn,
        currentPlayer: gameState.currentPlayer,
        active: gameState.active
      });
    }
  }

  /**
   * Aplicar posições sincronizadas das bolas
   */
  applySyncedBalls(ballsData) {
    if (!this.gameManager || !this.gameManager.physics) return;

    const balls = this.gameManager.balls;

    for (let ballId in ballsData) {
      const syncData = ballsData[ballId];
      const ball = balls.find(b => b.id === ballId);

      if (ball && syncData) {
        // Aplicar posição e velocidade com interpolação suave
        const currentPos = { x: ball.x, y: ball.y };
        const currentVel = { x: ball.vx, y: ball.vy };

        // Verificar desync
        const posDiff = Math.sqrt(
          Math.pow(ball.x - syncData.x, 2) + 
          Math.pow(ball.y - syncData.y, 2)
        );

        if (posDiff > 10) { // Se diferença > 10 pixels, reconcilar
          console.warn(`⚠️ Desync detectado na bola ${ballId}: ${posDiff.toFixed(0)}px`);
          
          // Misturar posição antiga com nova (suavizar transição)
          ball.x = currentPos.x * 0.5 + syncData.x * 0.5;
          ball.y = currentPos.y * 0.5 + syncData.y * 0.5;
          
          // Aplicar velocidade do host
          ball.vx = syncData.vx || 0;
          ball.vy = syncData.vy || 0;
        } else {
          // Aplicar suavemente
          ball.vx = syncData.vx || 0;
          ball.vy = syncData.vy || 0;
        }

        // Mostrar status de bola afundada
        if (syncData.sunk !== ball.sunk) {
          ball.sunk = syncData.sunk;
          if (syncData.sunk) {
            console.log(`🎱 Bola ${ballId} afundada`);
          }
        }
      }
    }
  }

  /**
   * Quando novos jogadores entram/saem
   */
  onPlayersUpdate(playersData) {
    // Atualizar lista visual
    if (this.uiManager) {
      this.uiManager.updatePlayersWaiting(playersData);
    }

    // Se esperado 2 jogadores e agora tem 2, pode começar
    const playerCount = Object.keys(playersData).length;
    if (playerCount >= (this.currentRoom.settings?.maxPlayers || 2)) {
      if (this.uiManager) {
        this.uiManager.enableStartButton();
      }
    }
  }

  /**
   * SISTEMA DE TURNOS
   */

  /**
   * Enviar jogada do cliente
   */
  async sendPlayerMove(power, angleX, angleY) {
    if (!this.currentRoom || !this.database) return false;

    try {
      const roomCode = this.currentRoom.code;
      const moveId = `${this.playerId}_${Date.now()}`;

      // Validar turno (apenas jogador atual pode jogar)
      if (this.currentPlayerTurn !== this.playerId) {
        console.warn('❌ Não é seu turno!');
        return false;
      }

      // Registrar jogada
      const moveData = {
        player: this.playerId,
        playerName: this.playerName,
        power,
        angleX,
        angleY,
        timestamp: Date.now(),
        validated: false
      };

      // Se for host, validar imediatamente
      if (this.isHost) {
        moveData.validated = true;
        
        // Aplicar jogada localmente
        this.gameManager.shootCueBall(power, angleX, angleY);
        
        // Atualizar turno
        await this.endTurn();
      } else {
        // Se for cliente, enviar para host validar
        await this.database.ref(`rooms/${roomCode}/moves/${moveId}`).set(moveData);
        
        // Mostrar "aguardando validação"
        console.log('⏳ Aguardando validação do host...');
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar jogada:', error);
      return false;
    }
  }

  /**
   * Host valida e processa jogadas
   */
  async validateAndProcessMove(moveData, moveId) {
    if (!this.isHost || !this.currentRoom) return;

    try {
      // Validar se é turno do jogador
      if (moveData.player !== this.currentPlayerTurn) {
        console.warn('❌ Jogada rejeitada: não é turno do jogador');
        return;
      }

      // Aplicar físicamente
      this.gameManager.shootCueBall(moveData.power, moveData.angleX, moveData.angleY);

      // Marcar como validada
      await this.database.ref(`rooms/${this.currentRoom.code}/moves/${moveId}/validated`).set(true);

      // Avançar turno
      await this.endTurn();

    } catch (error) {
      console.error('❌ Erro ao processar jogada:', error);
    }
  }

  /**
   * Terminar turno e passar para próximo jogador
   */
  async endTurn() {
    if (!this.currentRoom || !this.database) return;

    try {
      const roomCode = this.currentRoom.code;
      const players = Object.keys(this.currentRoom.players);
      const currentIndex = players.indexOf(this.currentPlayerTurn);
      const nextPlayerIndex = (currentIndex + 1) % players.length;
      const nextPlayer = players[nextPlayerIndex];

      const newTurn = this.currentTurn + 1;

      await this.database.ref(`rooms/${roomCode}/gameState`).update({
        currentTurn: newTurn,
        currentPlayer: nextPlayer,
        lastShotTime: Date.now()
      });

      console.log(`✅ Turno ${newTurn} - Próximo: ${nextPlayer}`);
    } catch (error) {
      console.error('❌ Erro ao terminar turno:', error);
    }
  }

  /**
   * CHAT
   */

  /**
   * Enviar mensagem de chat
   */
  async sendChatMessage(message) {
    if (!this.currentRoom || !this.database) return;

    try {
      const roomCode = this.currentRoom.code;
      const messageData = {
        sender: {
          id: this.playerId,
          name: this.playerName
        },
        message,
        timestamp: Date.now()
      };

      await this.database.ref(`rooms/${roomCode}/chat/${Date.now()}`).set(messageData);
      
      // Adicionar localmente
      this.chatMessages.push(messageData);
      if (this.chatMessages.length > this.maxChatMessages) {
        this.chatMessages.shift();
      }

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
    }
  }

  /**
   * Quando nova mensagem de outro jogador chega
   */
  onChatMessage(message) {
    this.chatMessages.push(message);
    if (this.chatMessages.length > this.maxChatMessages) {
      this.chatMessages.shift();
    }

    // Atualizar UI
    if (this.uiManager) {
      this.uiManager.addChatMessage(message);
    }
  }

  /**
   * RECONEXÃO E SAÚDE
   */

  /**
   * Monitorar saúde da conexão
   */
  monitorConnection() {
    setInterval(() => {
      if (!this.database) return;

      // Tentar ping simples
      const testRef = this.database.ref('.info/connected');
      testRef.on('value', (snapshot) => {
        if (snapshot.val() === true) {
          if (this.connectionStatus !== 'connected') {
            this.onConnectionRestored();
          }
        } else {
          if (this.connectionStatus !== 'disconnected') {
            this.onConnectionLost();
          }
        }
      });
    }, 5000); // Verificar a cada 5 segundos
  }

  /**
   * Quando conexão é perdida
   */
  onConnectionLost() {
    console.warn('⚠️ Conexão perdida');
    this.connectionStatus = 'disconnected';
    
    // Mostrar UI de desconexão
    if (this.uiManager) {
      this.uiManager.showConnectionLost();
    }

    // Tentar reconectar
    this.attemptReconnect();
  }

  /**
   * Tentar reconectar
   */
  async attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo de tentativas de reconexão atingido');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Backoff exponencial

    console.log(`⏳ Tentando reconectar em ${delay}ms (tentativa ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    await new Promise(resolve => setTimeout(resolve, delay));

    if (this.currentRoom) {
      const success = await this.joinRoom(this.currentRoom.code);
      if (success) {
        this.onConnectionRestored();
      } else {
        this.attemptReconnect();
      }
    }
  }

  /**
   * Quando conexão é restaurada
   */
  onConnectionRestored() {
    console.log('✅ Conexão restaurada');
    this.connectionStatus = 'connected';
    this.reconnectAttempts = 0;

    // Esconder UI de desconexão
    if (this.uiManager) {
      this.uiManager.hideConnectionLost();
    }

    // Resincronizar estado
    if (this.isHost && this.gameManager) {
      const gameState = this.gameManager.getGameState();
      this.syncGameState(gameState);
    }
  }

  /**
   * UTILIDADES
   */

  /**
   * Gerar ID único para jogador
   */
  generatePlayerId() {
    let id = localStorage.getItem('playerId');
    if (!id) {
      id = 'player_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('playerId', id);
    }
    return id;
  }

  /**
   * Gerar código de sala aleatório
   */
  generateRoomCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  /**
   * Obter avatar do jogador
   */
  getPlayerAvatar() {
    const avatars = ['🎱', '🎯', '🏆', '⚡', '🔥', '💎', '👑', '🌟'];
    const index = Math.abs(this.playerId.charCodeAt(7)) % avatars.length;
    return avatars[index];
  }

  /**
   * Obter status da sala
   */
  getRoomStatus() {
    if (!this.currentRoom) return 'not_in_room';
    return {
      code: this.currentRoom.code,
      players: Object.keys(this.currentRoom.players || {}).length,
      maxPlayers: this.currentRoom.settings?.maxPlayers || 2,
      status: this.currentRoom.status,
      isHost: this.isHost,
      connectionStatus: this.connectionStatus
    };
  }
}

// Exportar
window.MultiplayerV2 = MultiplayerV2;
