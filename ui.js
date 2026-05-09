/**
 * SISTEMA DE UI - GERENCIAMENTO DE INTERFACE
 */

class UIManager {
  constructor() {
    this.currentScreen = 'lobby';
    this.userProfile = {
      name: 'Jogador',
      level: 1,
      xp: 0,
      coins: 1000,
      wins: 0,
      losses: 0,
      avatar: '🎱'
    };
    this.chatActive = false;
    this.gameState = null;
  }

  /**
   * Mostrar tela específica
   */
  showScreen(screenId) {
    const screens = document.querySelectorAll('.screen-overlay');
    screens.forEach(screen => screen.classList.remove('active'));

    const screen = document.getElementById(screenId);
    if (screen) {
      screen.classList.add('active');
      this.currentScreen = screenId;
    }
  }

  /**
   * Esconder tela
   */
  hideScreen(screenId) {
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.classList.remove('active');
    }
  }

  /**
   * Inicializar evento dos botões
   */
  setupButtonListeners() {
    // Buttons da lobby principal
    this.onClick('btnPlayNow', () => this.startQuickMatch());
    this.onClick('btnTraining', () => this.startTraining());
    this.onClick('btnCreateRoom', () => this.showScreen('create-room-screen'));
    this.onClick('btnJoinRoom', () => this.showScreen('join-room-screen'));
    this.onClick('btnFriends', () => this.showFriends());
    this.onClick('btnRanking', () => this.showRanking());
    this.onClick('btnShop', () => this.showShop());
    this.onClick('btnSettings', () => this.showSettings());

    // Modais
    this.onClick('btnCreateRoomConfirm', () => this.createRoom());
    this.onClick('btnJoinRoomConfirm', () => this.joinRoom());
    this.onClick('btnLeaveWaiting', () => this.leaveWaiting());
    this.onClick('btnStartGame', () => this.startGame());

    // Controles do jogo
    this.onClick('btnUndo', () => this.undoLastShot());
    this.onClick('btnChat', () => this.toggleChat());
    this.onClick('btnMenuGame', () => this.showGamePauseMenu());
  }

  /**
   * Helper para adicionar evento de clique
   */
  onClick(id, callback) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('click', callback.bind(this));
    }
  }

  /**
   * Atualizar perfil do usuário
   */
  updateUserProfile(profile) {
    this.userProfile = { ...this.userProfile, ...profile };

    // Atualizar UI
    const nameEl = document.getElementById('userName');
    const levelEl = document.getElementById('userLevel');
    const coinsEl = document.getElementById('userCoins');
    const avatarEl = document.getElementById('userAvatar');
    const winsEl = document.getElementById('wins');
    const winsRateEl = document.getElementById('winRate');

    if (nameEl) nameEl.textContent = this.userProfile.name;
    if (levelEl) levelEl.textContent = `Nível ${this.userProfile.level} • ${this.userProfile.xp} XP`;
    if (coinsEl) coinsEl.textContent = this.userProfile.coins.toLocaleString('pt-BR');
    if (avatarEl) avatarEl.textContent = this.userProfile.avatar;
    if (winsEl) winsEl.textContent = this.userProfile.wins;
    if (winsRateEl) {
      const total = this.userProfile.wins + this.userProfile.losses;
      const rate = total > 0 ? Math.round((this.userProfile.wins / total) * 100) : 0;
      winsRateEl.textContent = `${rate}%`;
    }
  }

  /**
   * Iniciar partida rápida
   */
  startQuickMatch() {
    console.log('Iniciando partida rápida...');
    this.showScreen('waiting-room');
    if (window.multiplayerManager) {
      window.multiplayerManager.createMatch('1v1', 'casual');
    }
  }

  /**
   * Iniciar modo treino
   */
  startTraining() {
    console.log('Iniciando treino...');
    this.hideScreen('main-lobby');
    if (window.gameManager) {
      window.gameManager.startGame('training');
    }
  }

  /**
   * Criar sala
   */
  createRoom() {
    const roomName = document.getElementById('roomName')?.value || 'Sala Sem Nome';
    const roomMode = document.getElementById('roomMode')?.value || '1v1';
    const roomType = document.getElementById('roomType')?.value || 'casual';

    console.log('Criando sala:', { roomName, roomMode, roomType });

    if (window.multiplayerManager) {
      window.multiplayerManager.createRoom({
        name: roomName,
        mode: roomMode,
        type: roomType
      });
    }

    this.hideScreen('create-room-screen');
    this.showScreen('waiting-room');
  }

  /**
   * Entrar em sala
   */
  joinRoom() {
    const roomCode = document.getElementById('roomCode')?.value || '';

    if (!roomCode) {
      this.showMessage('Digite o código da sala', 'error');
      return;
    }

    console.log('Entrando em sala:', roomCode);
    if (window.multiplayerManager) {
      window.multiplayerManager.joinRoom(roomCode);
    }

    this.hideScreen('join-room-screen');
    this.showScreen('waiting-room');
  }

  /**
   * Sair da sala de espera
   */
  leaveWaiting() {
    if (window.multiplayerManager) {
      window.multiplayerManager.leaveRoom();
    }
    this.hideScreen('waiting-room');
    this.showScreen('main-lobby');
  }

  /**
   * Iniciar jogo
   */
  startGame() {
    console.log('Iniciando jogo...');
    this.hideScreen('waiting-room');
    if (window.gameManager) {
      window.gameManager.startGame('multiplayer');
    }
  }

  /**
   * Desfazer última jogada
   */
  undoLastShot() {
    console.log('Desfazendo jogada...');
    if (window.gameManager) {
      window.gameManager.undoShot();
    }
  }

  /**
   * Alternar chat
   */
  toggleChat() {
    const chatPanel = document.getElementById('chat-panel');
    if (chatPanel) {
      chatPanel.classList.toggle('active');
      this.chatActive = chatPanel.classList.contains('active');
      if (this.chatActive) {
        document.getElementById('chatInput')?.focus();
      }
    }
  }

  /**
   * Enviar mensagem de chat
   */
  sendChatMessage() {
    const input = document.getElementById('chatInput');
    if (input && input.value.trim()) {
      const message = input.value.trim();
      if (window.multiplayerManager) {
        window.multiplayerManager.sendChatMessage(message);
      }
      this.addChatMessage(this.userProfile.name, message, 'own');
      input.value = '';
    }
  }

  /**
   * Adicionar mensagem no chat
   */
  addChatMessage(username, message, type = 'other') {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const msgEl = document.createElement('div');
    msgEl.className = `chat-message ${type}`;
    msgEl.innerHTML = `
      <div class="username">${username}</div>
      <div class="text">${this.escapeHtml(message)}</div>
    `;

    chatMessages.appendChild(msgEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  /**
   * Mostrar mensagem na tela
   */
  showMessage(text, type = 'info') {
    const messagesContainer = document.getElementById('gameMessages');
    if (!messagesContainer) return;

    const msgEl = document.createElement('div');
    msgEl.className = `message-item ${type === 'error' ? 'highlight' : ''}`;
    msgEl.textContent = text;

    messagesContainer.appendChild(msgEl);

    // Remover após 3 segundos
    setTimeout(() => msgEl.remove(), 3000);
  }

  /**
   * Atualizar informações dos jogadores
   */
  updatePlayerInfo(player1, player2, mode = '1v1') {
    const p1Name = document.getElementById('playerLeftName');
    const p1Status = document.getElementById('playerLeftStatus');
    const p1Balls = document.getElementById('playerLeftBalls');

    const p2Name = document.getElementById('playerRightName');
    const p2Status = document.getElementById('playerRightStatus');
    const p2Balls = document.getElementById('playerRightBalls');

    if (p1Name) p1Name.textContent = player1.name;
    if (p1Status) p1Status.textContent = player1.status;
    if (p1Balls) p1Balls.textContent = `${player1.balls || 0}/7`;

    if (p2Name) p2Name.textContent = player2.name;
    if (p2Status) p2Status.textContent = player2.status;
    if (p2Balls) p2Balls.textContent = `${player2.balls || 0}/7`;
  }

  /**
   * Atualizar barra de força
   */
  updatePowerBar(percentage) {
    const powerFill = document.querySelector('.power-fill');
    const powerValue = document.getElementById('powerValue');

    if (powerFill) {
      powerFill.style.width = `${percentage * 100}%`;
    }
    if (powerValue) {
      powerValue.textContent = `${Math.round(percentage * 100)}%`;
    }
  }

  /**
   * Mostrar modal de pausa
   */
  showGamePauseMenu() {
    const pauseModal = document.getElementById('pause-modal');
    if (pauseModal) {
      pauseModal.classList.add('active');
    }
  }

  /**
   * Fechar modal de pausa
   */
  hideGamePauseMenu() {
    const pauseModal = document.getElementById('pause-modal');
    if (pauseModal) {
      pauseModal.classList.remove('active');
    }
  }

  /**
   * Mostrar screen de amigos
   */
  showFriends() {
    this.showMessage('Sistema de amigos em desenvolvimento!', 'info');
  }

  /**
   * Mostrar ranking
   */
  showRanking() {
    this.showMessage('Ranking global em desenvolvimento!', 'info');
  }

  /**
   * Mostrar loja
   */
  showShop() {
    this.showMessage('Loja de tacos e skins em desenvolvimento!', 'info');
  }

  /**
   * Mostrar configurações
   */
  showSettings() {
    this.showMessage('Configurações em desenvolvimento!', 'info');
  }

  /**
   * Atualizar placar de times
   */
  updateTeamScore(team1Score, team2Score, team1Name, team2Name) {
    const teamScore = document.getElementById('teamScore');
    if (teamScore) {
      teamScore.style.display = 'flex';
      document.getElementById('teamLeftScore').textContent = team1Score;
      document.getElementById('teamRightScore').textContent = team2Score;
      document.getElementById('teamLeftName').textContent = team1Name;
      document.getElementById('teamRightName').textContent = team2Name;
    }
  }

  /**
   * Mostrar fim de jogo
   */
  showEndGame(winner, stats) {
    const modal = document.getElementById('endgame-modal');
    const title = document.getElementById('endgameTitle');
    const statsDiv = document.getElementById('endgameStats');

    if (title) {
      title.textContent = winner === 'draw' ? 'Empate!' : `${winner} Venceu!`;
    }

    if (statsDiv) {
      statsDiv.innerHTML = `
        <div class="stat">
          <span>Duração</span>
          <span class="stat-value">${stats.duration}s</span>
        </div>
        <div class="stat">
          <span>Bolas Potadas</span>
          <span class="stat-value">${stats.ballsPotted}</span>
        </div>
        <div class="stat">
          <span>Pontuação</span>
          <span class="stat-value">${stats.score}</span>
        </div>
      `;
    }

    if (modal) {
      modal.classList.add('active');
    }
  }

  /**
   * Escape HTML para segurança
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Instância global
const uiManager = new UIManager();

// Funções globais para HTML
function closeScreen(id) {
  uiManager.hideScreen(id);
}

function toggleChat() {
  uiManager.toggleChat();
}

function sendChatMessage() {
  uiManager.sendChatMessage();
}

function resumeGame() {
  uiManager.hideGamePauseMenu();
  if (window.gameManager) {
    window.gameManager.resumeGame();
  }
}

function exitGame() {
  uiManager.hideGamePauseMenu();
  if (window.gameManager) {
    window.gameManager.exitGame();
  }
}

function backToLobby() {
  const modal = document.getElementById('endgame-modal');
  if (modal) modal.classList.remove('active');
  uiManager.showScreen('main-lobby');
  if (window.gameManager) {
    window.gameManager.reset();
  }
}

function matchAgain() {
  const modal = document.getElementById('endgame-modal');
  if (modal) modal.classList.remove('active');
  uiManager.startGame();
}

// Inicializar UI quando documento carregar
document.addEventListener('DOMContentLoaded', () => {
  uiManager.setupButtonListeners();
  uiManager.updateUserProfile({
    name: 'CanalDog',
    level: 47,
    xp: 12450,
    coins: 245000,
    wins: 127,
    losses: 43
  });
});
