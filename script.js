/**
 * JOGO DE SINUCA - SCRIPT PRINCIPAL
 * Lógica do jogo, renderização e gerenciamento
 */

class PoolGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.physics = new PoolPhysics(this.canvas.width, this.canvas.height);
    this.gameState = 'idle'; // lobby, waiting, playing, paused, ended
    this.currentTurn = 0;
    this.ballsDown = [false, false, false];
    this.gameMode = 'training'; // training, multiplayer, ai
    this.frameCount = 0;
    this.isAiming = false;
    this.aimAngle = 0;
    this.aimPower = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    
    // Configuração da mesa
    this.tableX = 50;
    this.tableY = 40;
    this.tableWidth = window.innerWidth - 100;
    this.tableHeight = window.innerHeight - 120;
    
    // Colors
    this.colors = {
      ballWhite: '#FFFFFF',
      ballSolid: ['#FFFF00', '#FB8D3D', '#D63C3C', '#C5008C', '#000000'],
      ballStripe: ['#FFE4B5', '#FFB6C1', '#E6E6FA', '#D1D1FF', '#F0F0F0'],
      tableGreen: '#0B5D1A',
      tableBorder: '#4A3728',
      cushion: '#1A4D2E',
      pocket: '#000000'
    };

    this.setupEvents();
    this.startGame('training');
  }

  /**
   * Configurar eventos do mouse/teclado
   */
  setupEvents() {
    // Mouse movement
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
      this.updateAim();
    });

    // Mouse down - começar aiming
    this.canvas.addEventListener('mousedown', (e) => {
      if (this.gameState === 'playing' && this.physics.areBallsStationary()) {
        this.isAiming = true;
      }
    });

    // Mouse up - disparar
    this.canvas.addEventListener('mouseup', (e) => {
      if (this.isAiming) {
        this.shootCue();
        this.isAiming = false;
      }
    });

    // Touch events para celular
    this.canvas.addEventListener('touchmove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this.mouseX = touch.clientX - rect.left;
      this.mouseY = touch.clientY - rect.top;
      this.updateAim();
    });

    this.canvas.addEventListener('touchstart', (e) => {
      if (this.gameState === 'playing' && this.physics.areBallsStationary()) {
        this.isAiming = true;
      }
    });

    this.canvas.addEventListener('touchend', (e) => {
      if (this.isAiming) {
        this.shootCue();
        this.isAiming = false;
      }
    });

    // Resize
    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        uiManager.showGamePauseMenu();
      }
    });
  }

  /**
   * Redimensionar Canvas
   */
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.tableWidth = window.innerWidth - 100;
    this.tableHeight = window.innerHeight - 120;
    this.physics.width = this.canvas.width;
    this.physics.height = this.canvas.height;
  }

  /**
   * Iniciar jogo
   */
  startGame(mode) {
    this.gameMode = mode;
    this.gameState = 'playing';
    this.resizeCanvas();

    // Adicionar a loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.remove('active');
    }

    // Esconder lobby principal
    const mainLobby = document.getElementById('main-lobby');
    if (mainLobby) {
      mainLobby.classList.remove('active');
    }

    // Setup física
    this.physics.reset();
    this.physics.setupBalls(
      this.tableWidth / 2,
      this.tableHeight / 2
    );
    this.physics.setupPockets(this.tableWidth, this.tableHeight);

    // Iniciar loop de renderização
    this.gameLoop();

    console.log(`🎱 Jogo iniciado em modo: ${mode}`);
  }

  /**
   * Loop principal de renderização
   */
  gameLoop = () => {
    if (this.gameState === 'ended') return;

    // Atualizar física
    this.physics.update();

    // Renderizar
    this.render();

    // Próximo frame
    requestAnimationFrame(this.gameLoop);
  }

  /**
   * Renderizar frame
   */
  render() {
    // Limpar canvas
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Desenhar fundo com texture
    this.drawBackground();

    // Desenhar mesa
    this.drawTable();

    // Desenhar bolas
    this.drawBalls();

    // Desenhar taco se aiming
    if (this.isAiming) {
      this.drawCue();
      this.drawAimLine();
    }

    // Desenhar mira
    if (this.gameState === 'playing' && this.physics.areBallsStationary()) {
      this.drawAimReticle();
    }

    this.frameCount++;
  }

  /**
   * Desenhar fundo com efeito neon
   */
  drawBackground() {
    // Gradient de fundo
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#0A0015');
    gradient.addColorStop(0.5, '#1a0025');
    gradient.addColorStop(1, '#0f001a');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Luzes de fundo (neon)
    this.drawNeonLights();
  }

  /**
   * Desenhar luzes neon de fundo
   */
  drawNeonLights() {
    // Glow esquerdo
    const glowLeft = this.ctx.createRadialGradient(100, 200, 0, 100, 200, 400);
    glowLeft.addColorStop(0, 'rgba(255, 0, 136, 0.15)');
    glowLeft.addColorStop(1, 'transparent');
    this.ctx.fillStyle = glowLeft;
    this.ctx.fillRect(0, 0, 300, 400);

    // Glow direito
    const glowRight = this.ctx.createRadialGradient(
      this.canvas.width - 100, 
      this.canvas.height - 200, 
      0, 
      this.canvas.width - 100, 
      this.canvas.height - 200, 
      400
    );
    glowRight.addColorStop(0, 'rgba(0, 255, 200, 0.1)');
    glowRight.addColorStop(1, 'transparent');
    this.ctx.fillStyle = glowRight;
    this.ctx.fillRect(this.canvas.width - 300, this.canvas.height - 400, 300, 400);
  }

  /**
   * Desenhar mesa
   */
  drawTable() {
    const x = this.tableX;
    const y = this.tableY;
    const w = this.tableWidth;
    const h = this.tableHeight;

    // Superfície da mesa
    this.ctx.fillStyle = this.colors.tableGreen;
    this.ctx.fillRect(x, y, w, h);

    // Gradient para profundidade
    const gradient = this.ctx.createLinearGradient(x, y, x, y + h);
    gradient.addColorStop(0, '#0D6E2D');
    gradient.addColorStop(1, '#0B5D1A');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, w, h);

    // Bordas (cushions)
    this.drawCushions(x, y, w, h);

    // Buracos (pockets)
    for (let pocket of this.physics.pockets) {
      this.drawPocket(pocket.x, pocket.y, pocket.radius);
    }

    // Grid de diamond para referência
    this.drawDiamonds(x, y, w, h);
  }

  /**
   * Desenhar cushions (bordas)
   */
  drawCushions(x, y, w, h) {
    const cushionWidth = 15;
    this.ctx.fillStyle = this.colors.cushion;
    this.ctx.shadowColor = 'rgba(0, 255, 136, 0.4)';
    this.ctx.shadowBlur = 10;

    // Esquerda
    this.ctx.fillRect(x - cushionWidth, y, cushionWidth, h);
    // Direita
    this.ctx.fillRect(x + w, y, cushionWidth, h);
    // Topo
    this.ctx.fillRect(x, y - cushionWidth, w, cushionWidth);
    // Fundo
    this.ctx.fillRect(x, y + h, w, cushionWidth);

    this.ctx.shadowColor = 'transparent';
  }

  /**
   * Desenhar buraco
   */
  drawPocket(x, y, radius) {
    this.ctx.fillStyle = this.colors.pocket;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Glow ao redor
    this.ctx.strokeStyle = 'rgba(255, 0, 136, 0.5)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  /**
   * Desenhar diamonds de referência
   */
  drawDiamonds(x, y, w, h) {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
      const px = x + (w / 4) * i;
      for (let j = 0; j <= 2; j++) {
        const py = y + (h / 2) * j;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.fillRect(px - 2, py - 2, 4, 4);
      }
    }
  }

  /**
   * Desenhar todas as bolas
   */
  drawBalls() {
    for (let ball of this.physics.balls) {
      if (ball.sunk) continue;
      this.drawBall(ball);
    }
  }

  /**
   * Desenhar uma bola
   */
  drawBall(ball) {
    const x = ball.x + this.tableX;
    const y = ball.y + this.tableY;
    const radius = ball.radius;

    if (ball.isCueBall) {
      // Bola branca
      this.ctx.fillStyle = this.colors.ballWhite;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Número 0
      this.ctx.fillStyle = '#000000';
      this.ctx.font = 'bold 12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('0', x, y);
    } else {
      // Bola normal
      const isStripe = ball.id > 8;
      const colorIndex = (ball.id - 1) % 5;

      // Fundo da bola
      if (isStripe) {
        this.ctx.fillStyle = this.colors.ballStripe[colorIndex];
      } else {
        this.ctx.fillStyle = this.colors.ballSolid[colorIndex];
      }

      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Listras (se stripe)
      if (isStripe) {
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2);
        this.ctx.stroke();
      }

      // Número na bola
      this.ctx.fillStyle = isStripe ? '#000000' : '#FFFFFF';
      this.ctx.font = 'bold 11px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(ball.id.toString(), x, y);
    }

    // Shadow/Glow
    this.ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
    this.ctx.shadowBlur = 5;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius + 1, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.shadowColor = 'transparent';
  }

  /**
   * Desenhar taco (cue)
   */
  drawCue() {
    const cueBall = this.physics.getCueBall();
    if (!cueBall) return;

    const startX = cueBall.x + this.tableX;
    const startY = cueBall.y + this.tableY;
    const endX = this.mouseX;
    const endY = this.mouseY;

    // Linha do taco
    this.ctx.strokeStyle = 'rgba(139, 90, 43, 0.8)';
    this.ctx.lineWidth = 8;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();

    // Grip do taco
    this.ctx.strokeStyle = 'rgba(100, 50, 20, 0.9)';
    this.ctx.lineWidth = 10;
    this.ctx.beginPath();
    this.ctx.moveTo(endX - 40, endY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();

    // Ponta do taco
    this.ctx.fillStyle = 'rgba(200, 150, 100, 0.9)';
    this.ctx.beginPath();
    this.ctx.arc(startX, startY, 4, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Desenhar linha de mira
   */
  drawAimLine() {
    const cueBall = this.physics.getCueBall();
    if (!cueBall) return;

    const x = cueBall.x + this.tableX;
    const y = cueBall.y + this.tableY;

    // Linha de mira
    this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.4)';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);

    // Extensão até o mouse ou bola
    const dx = this.mouseX - x;
    const dy = this.mouseY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const ratio = 200 / distance;

    this.ctx.lineTo(x + dx * ratio, y + dy * ratio);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Indicador de ângulo
    this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 30, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  /**
   * Desenhar reticle de mira
   */
  drawAimReticle() {
    const cueBall = this.physics.getCueBall();
    if (!cueBall) return;

    const x = this.mouseX;
    const y = this.mouseY;

    this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.5)';
    this.ctx.lineWidth = 2;

    // Círculo
    this.ctx.beginPath();
    this.ctx.arc(x, y, 15, 0, Math.PI * 2);
    this.ctx.stroke();

    // Cruz
    this.ctx.beginPath();
    this.ctx.moveTo(x - 20, y);
    this.ctx.lineTo(x + 20, y);
    this.ctx.moveTo(x, y - 20);
    this.ctx.lineTo(x, y + 20);
    this.ctx.stroke();
  }

  /**
   * Atualizar aiming
   */
  updateAim() {
    if (!this.isAiming) return;

    const cueBall = this.physics.getCueBall();
    if (!cueBall) return;

    const startX = cueBall.x + this.tableX;
    const startY = cueBall.y + this.tableY;

    const dx = this.mouseX - startX;
    const dy = this.mouseY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Power entre 0 e 0.08
    this.aimPower = Math.min(distance / 500, 0.08);

    // Atualizar UI
    uiManager.updatePowerBar(this.aimPower / 0.08);
  }

  /**
   * Disparar taco
   */
  shootCue() {
    const cueBall = this.physics.getCueBall();
    if (!cueBall || !this.isAiming) return;

    const startX = cueBall.x + this.tableX;
    const startY = cueBall.y + this.tableY;

    const dx = this.mouseX - startX;
    const dy = this.mouseY - startY;

    this.physics.shootCueBall(this.aimPower, dx, dy);

    console.log(`🎯 Tacada com força: ${(this.aimPower * 100).toFixed(0)}%`);
    uiManager.showMessage(`Força: ${(this.aimPower * 100).toFixed(0)}%`);

    // Sincronizar com multiplayer se necessário
    if (this.gameMode === 'multiplayer') {
      window.multiplayerManager?.sendPlayerMove({
        power: this.aimPower,
        angleX: dx,
        angleY: dy
      });
    }
  }

  /**
   * Desfazer última jogada
   */
  undoShot() {
    console.log('↶ Desfazendo jogada...');
    uiManager.showMessage('Jogada desfeita');
  }

  /**
   * Retomar jogo
   */
  resumeGame() {
    this.gameState = 'playing';
    console.log('▶️ Jogo retomado');
  }

  /**
   * Sair do jogo
   */
  exitGame() {
    this.gameState = 'ended';
    console.log('🛑 Saindo do jogo');
    uiManager.showScreen('main-lobby');
  }

  /**
   * Reset do jogo
   */
  reset() {
    this.physics.reset();
    this.gameState = 'idle';
    console.log('🔄 Jogo resetado');
  }
}

// Instância global do jogo
let gameManager;

// Inicializar quando página carregar
document.addEventListener('DOMContentLoaded', () => {
  // Esconder loading screen após 1s
  setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.remove('active');
    }
  }, 1000);

  // Criar jogo
  gameManager = new PoolGame();
  window.gameManager = gameManager;

  console.log('✅ Jogo de Sinuca inicializado');
});
