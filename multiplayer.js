/**
 * SISTEMA MULTIPLAYER COM FIREBASE
 * Gerencia partidas online e sincronização em tempo real
 */

class MultiplayerManager {
  constructor() {
    this.currentRoom = null;
    this.currentPlayer = null;
    this.isHost = false;
    this.gameState = 'lobby';
    this.db = null;
    this.listeners = {};
    this.initialized = false;

    // Inicializar Firebase
    this.initFirebase();
  }

  /**
   * Inicializar Firebase
   */
  initFirebase() {
    // Configuração do Firebase (você pode usar um modo offline para testes)
    // Em produção, substitua pelas credenciais reais
    
    try {
      if (window.firebase && window.firebase.database) {
        this.db = firebase.database();
        this.initialized = true;
        console.log('✅ Firebase inicializado');
      } else {
        console.warn('⚠️ Firebase não disponível, usando modo offline');
        this.initOfflineMode();
      }
    } catch (e) {
      console.error('❌ Erro ao inicializar Firebase:', e);
      this.initOfflineMode();
    }
  }

  /**
   * Modo offline para testes locais
   */
  initOfflineMode() {
    console.log('🎮 Usando modo offline (local storage)');
    this.initialized = true;
    this.mockDb = {
      rooms: {},
      matches: {}
    };
  }

  /**
   * Gerar código de sala aleatória
   */
  generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * Gerar ID único
   */
  generateId() {
    return Date.now() + '-' + Math.random().toString(36).substring(2, 9);
  }

  /**
   * Criar partida rápida
   */
  createMatch(mode, type) {
    const matchId = this.generateId();
    const roomCode = this.generateRoomCode();

    this.currentPlayer = {
      id: this.generateId(),
      name: uiManager.userProfile.name,
      avatar: uiManager.userProfile.avatar,
      team: 'team-a',
      ready: false
    };

    this.currentRoom = {
      id: matchId,
      code: roomCode,
      mode: mode,
      type: type,
      host: this.currentPlayer.id,
      players: [this.currentPlayer],
      status: 'waiting',
      createdAt: Date.now(),
      maxPlayers: this.getMaxPlayers(mode),
      teams: {
        'team-a': [this.currentPlayer],
        'team-b': []
      }
    };

    this.isHost = true;

    console.log('🎱 Partida criada:', this.currentRoom);

    // Atualizar UI da waiting room
    this.updateWaitingRoomUI();

    // Simular outro jogador entrando RAPIDINHO
    if (!this.db) {
      setTimeout(() => {
        this.simulatePlayerJoin();
      }, 500); // Mais rápido!
    }

    return this.currentRoom;
  }

  /**
   * Criar sala personalizada
   */
  createRoom(options) {
    const matchId = this.generateId();
    const roomCode = this.generateRoomCode();

    this.currentPlayer = {
      id: this.generateId(),
      name: uiManager.userProfile.name,
      avatar: uiManager.userProfile.avatar,
      team: 'team-a',
      ready: false
    };

    this.currentRoom = {
      id: matchId,
      code: roomCode,
      name: options.name || 'Sala',
      mode: options.mode || '1v1',
      type: options.type || 'casual',
      host: this.currentPlayer.id,
      players: [this.currentPlayer],
      status: 'waiting',
      createdAt: Date.now(),
      private: options.private || false,
      maxPlayers: this.getMaxPlayers(options.mode),
      teams: {
        'team-a': [this.currentPlayer],
        'team-b': []
      }
    };

    this.isHost = true;

    if (!this.db) {
      setTimeout(() => {
        this.simulatePlayerJoin();
      }, 1500);
    }

    return this.currentRoom;
  }

  /**
   * Entrar em sala
   */
  joinRoom(roomCode) {
    console.log('🚪 Entrando em sala:', roomCode);

    const newPlayer = {
      id: this.generateId(),
      name: uiManager.userProfile.name,
      avatar: uiManager.userProfile.avatar,
      team: 'team-b',
      ready: false
    };

    // Simulação de entrada
    if (!this.db) {
      this.currentRoom = {
        id: this.generateId(),
        code: roomCode,
        mode: '1v1',
        type: 'casual',
        host: this.generateId(),
        players: [
          {
            id: this.generateId(),
            name: 'Rival',
            avatar: '🎯',
            team: 'team-a',
            ready: false
          },
          newPlayer
        ],
        status: 'waiting',
        maxPlayers: 2,
        teams: {
          'team-a': [{ id: this.generateId(), name: 'Rival' }],
          'team-b': [newPlayer]
        }
      };
    }

    this.currentPlayer = newPlayer;
    this.isHost = false;

    uiManager.showMessage(`✅ Conectado à sala ${roomCode}`);
    return true;
  }

  /**
   * Sair da sala
   */
  leaveRoom() {
    console.log('👋 Saindo da sala');
    if (this.currentRoom && this.currentPlayer) {
      // Remover jogador da sala

      this.currentRoom = null;
      this.currentPlayer = null;
      this.isHost = false;
    }
  }

  /**
   * Marcar como pronto
   */
  setPlayerReady(ready) {
    if (this.currentPlayer) {
      this.currentPlayer.ready = ready;
      console.log(`${ready ? '✅' : '❌'} Status: ${ready ? 'Pronto' : 'Não pronto'}`);
    }
  }

  /**
   * Iniciar jogo
   */
  startGame() {
    if (!this.isHost) {
      console.warn('⚠️ Apenas o host pode iniciar o jogo');
      return false;
    }

    if (this.currentRoom) {
      this.currentRoom.status = 'playing';
      this.gameState = 'playing';
      console.log('🎮 Jogo iniciado!');
      return true;
    }
    return false;
  }

  /**
   * Sincronizar estado do jogo
   */
  syncGameState(ballsData, currentPlayer) {
    if (!this.currentRoom) return;

    const syncData = {
      timestamp: Date.now(),
      ballsState: ballsData,
      currentPlayer: currentPlayer,
      roomId: this.currentRoom.id
    };

    // Enviar para Firebase ou local storage
    if (this.db) {
      // Implementar sincronização real
    } else {
      // Modo offline
      console.log('💾 Estado sincronizado (offline)');
    }
  }

  /**
   * Enviar mensagem de chat
   */
  sendChatMessage(message) {
    const chatData = {
      sender: this.currentPlayer.name,
      message: message,
      timestamp: Date.now(),
      roomId: this.currentRoom?.id
    };

    console.log('💬 Mensagem enviada:', chatData);
    // Sincronizar com Firebase
  }

  /**
   * Simular entrada de outro jogador (modo offline)
   */
  simulatePlayerJoin() {
    const rivals = ['Ninja', 'Phoenix', 'Shadow', 'Storm', 'Legend', 'Dragon'];
    const randomRival = rivals[Math.floor(Math.random() * rivals.length)];

    const newPlayer = {
      id: this.generateId(),
      name: randomRival,
      avatar: '🎯',
      team: 'team-b',
      ready: false
    };

    if (this.currentRoom) {
      this.currentRoom.players.push(newPlayer);
      this.currentRoom.teams['team-b'].push(newPlayer);

      console.log(`👉 ${randomRival} entrou na sala!`);
      uiManager.showMessage(`${randomRival} entrou na sala`);
      
      // Atualizar UI
      this.updateWaitingRoomUI();
      uiManager.updatePlayerInfo(
        this.currentRoom.players[0],
        newPlayer
      );

      // Habilitar botão de iniciar
      const startBtn = document.getElementById('btnStartGame');
      if (startBtn) {
        startBtn.disabled = false;
        startBtn.style.opacity = '1';
        startBtn.style.cursor = 'pointer';
      }
    }
  }

  /**
   * Atualizar UI da sala de espera
   */
  updateWaitingRoomUI() {
    if (!this.currentRoom) return;

    // Atualizar nome da sala
    const roomNameEl = document.getElementById('waitingRoomName');
    if (roomNameEl) {
      roomNameEl.textContent = this.currentRoom.name || `Sala ${this.currentRoom.code}`;
    }

    // Atualizar código da sala (VISÍVEL!)
    const roomCodeEl = document.getElementById('waitingRoomCode');
    if (roomCodeEl) {
      roomCodeEl.textContent = this.currentRoom.code;
      roomCodeEl.style.fontSize = '18px';
      roomCodeEl.style.fontWeight = 'bold';
      roomCodeEl.style.letterSpacing = '2px';
      roomCodeEl.style.color = '#00ff88';
      console.log('📍 Código da sala:', this.currentRoom.code);
    }

    // Atualizar lista de jogadores
    const playersList = document.getElementById('playersWaitingList');
    if (playersList) {
      playersList.innerHTML = '';
      
      for (let player of this.currentRoom.players) {
        const playerEl = document.createElement('div');
        playerEl.className = 'player-slot occupied';
        playerEl.innerHTML = `
          <div style="font-size: 24px; margin-bottom: 5px;">${player.avatar}</div>
          <div style="font-weight: bold; color: #00ff88;">${player.name}</div>
          <div style="font-size: 12px; color: #00ff88; opacity: 0.7;">Team ${player.team === 'team-a' ? 'A' : 'B'}</div>
        `;
        playersList.appendChild(playerEl);
      }
    }

    // Atualizar status de aguardando
    const statusEl = document.getElementById('waitingStatus');
    if (statusEl) {
      const count = this.currentRoom.players.length;
      const max = this.currentRoom.maxPlayers;
      statusEl.textContent = `Aguardando jogadores (${count}/${max})...`;
      
      // Mudar cor se cheio
      if (count >= max) {
        statusEl.style.color = '#00ff88';
        statusEl.textContent = `✅ Sala cheia! Pronto para começar!`;
      } else {
        statusEl.style.color = '#00ff88';
      }
    }
  }

  /**
   * Obter máximo de jogadores
   */
  getMaxPlayers(mode) {
    const modes = {
      '1v1': 2,
      '2v2': 4,
      '3v3': 6,
      'ffa': 4
    };
    return modes[mode] || 2;
  }

  /**
   * Enviar movimento do jogador
   */
  sendPlayerMove(moveData) {
    const data = {
      playerId: this.currentPlayer.id,
      move: moveData,
      timestamp: Date.now()
    };

    // Sincronizar com outros jogadores
    console.log('🎬 Movimento enviado:', data);
  }

  /**
   * Receber movimento de outro jogador
   */
  onPlayerMove(callback) {
    this.listeners.playerMove = callback;
  }

  /**
   * Inicializar listeners
   */
  setupListeners() {
    if (!this.currentRoom) return;

    // Escutar mudanças na sala
    console.log('👂 Listeners inicializados');
  }

  /**
   * Fechar conexão
   */
  disconnect() {
    Object.keys(this.listeners).forEach(key => {
      // Remover listeners
    });
    console.log('🔌 Desconectado');
  }
}

// Instância global
const multiplayerManager = new MultiplayerManager();
window.multiplayerManager = multiplayerManager;
