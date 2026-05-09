/**
 * DEBUG E TESTES
 * Ferramentas para testar e debugar o jogo
 */

class GameDebugger {
  constructor() {
    this.enabled = true;
    this.stats = {
      fps: 0,
      frameTime: 0,
      ballsCount: 0,
      ballsSpeed: 0
    };
    this.setupDebugPanel();
  }

  /**
   * Criar painel de debug
   */
  setupDebugPanel() {
    if (!this.enabled) return;

    // Criar elemento do painel
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      border: 2px solid #00ff88;
      border-radius: 8px;
      padding: 15px;
      font-family: monospace;
      font-size: 12px;
      color: #00ff88;
      z-index: 1000;
      max-width: 300px;
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
    `;

    panel.innerHTML = `
      <div style="margin-bottom: 10px; font-weight: bold;">🐛 DEBUG</div>
      <div>FPS: <span id="debug-fps">0</span></div>
      <div>Balls: <span id="debug-balls">0</span></div>
      <div>Avg Speed: <span id="debug-speed">0</span></div>
      <div>Canvas: <span id="debug-canvas">0x0</span></div>
      <hr style="border-color: rgba(0, 255, 136, 0.3); margin: 8px 0;">
      <button id="debug-reset" style="
        background: rgba(0, 255, 136, 0.2);
        border: 1px solid #00ff88;
        color: #00ff88;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-family: monospace;
      ">Reset Game</button>
      <button id="debug-spawn" style="
        background: rgba(0, 255, 136, 0.2);
        border: 1px solid #00ff88;
        color: #00ff88;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        margin-left: 5px;
        font-family: monospace;
      ">Spawn Ball</button>
    `;

    document.body.appendChild(panel);

    // Event listeners
    document.getElementById('debug-reset')?.addEventListener('click', () => {
      this.resetGame();
    });

    document.getElementById('debug-spawn')?.addEventListener('click', () => {
      this.spawnBall();
    });

    this.panel = panel;
  }

  /**
   * Atualizar stats
   */
  updateStats(game) {
    if (!this.enabled) return;

    // FPS
    const now = performance.now();
    if (window.lastFrameTime) {
      const frameTime = now - window.lastFrameTime;
      this.stats.fps = Math.round(1000 / frameTime);
      this.stats.frameTime = frameTime.toFixed(2);
    }
    window.lastFrameTime = now;

    // Stats do jogo
    if (game && game.physics) {
      this.stats.ballsCount = game.physics.balls.length;

      let totalSpeed = 0;
      for (let ball of game.physics.balls) {
        const speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
        totalSpeed += speed;
      }
      this.stats.ballsSpeed = (totalSpeed / this.stats.ballsCount).toFixed(2);
    }

    if (game && game.canvas) {
      document.getElementById('debug-canvas').textContent =
        `${game.canvas.width}x${game.canvas.height}`;
    }

    // Atualizar UI
    document.getElementById('debug-fps').textContent = this.stats.fps;
    document.getElementById('debug-balls').textContent = this.stats.ballsCount;
    document.getElementById('debug-speed').textContent = this.stats.ballsSpeed;
  }

  /**
   * Reset do jogo
   */
  resetGame() {
    console.log('🔄 Resetando jogo...');
    if (window.gameManager) {
      window.gameManager.physics.reset();
      window.gameManager.physics.setupBalls(
        window.gameManager.tableWidth / 2,
        window.gameManager.tableHeight / 2
      );
      window.gameManager.physics.setupPockets(
        window.gameManager.tableWidth,
        window.gameManager.tableHeight
      );
    }
  }

  /**
   * Spawn una nova bola
   */
  spawnBall() {
    console.log('🎱 Criando nova bola...');
    if (window.gameManager && window.gameManager.physics) {
      const x = Math.random() * 200 + 100;
      const y = Math.random() * 200 + 100;
      window.gameManager.physics.createBall(x, y);
    }
  }

  /**
   * Testar colisões
   */
  testCollisions() {
    console.log('Testing collisions...');
    if (window.gameManager && window.gameManager.physics) {
      const balls = window.gameManager.physics.balls;
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const dx = balls[j].x - balls[i].x;
          const dy = balls[j].y - balls[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = balls[i].radius + balls[j].radius;

          if (dist < minDist) {
            console.log(`✓ Colisão detectada: bola ${i} <-> bola ${j}`);
          }
        }
      }
    }
  }

  /**
   * Listar todas as bolas
   */
  listBalls() {
    console.log('=== BOLAS NO JOGO ===');
    if (window.gameManager && window.gameManager.physics) {
      window.gameManager.physics.balls.forEach((ball, idx) => {
        console.log(`Ball ${idx}:`, {
          id: ball.id,
          pos: `(${ball.x.toFixed(2)}, ${ball.y.toFixed(2)})`,
          vel: `(${ball.vx.toFixed(2)}, ${ball.vy.toFixed(2)})`,
          speed: Math.sqrt(ball.vx ** 2 + ball.vy ** 2).toFixed(2),
          sunk: ball.sunk,
          isCueBall: ball.isCueBall
        });
      });
    }
  }

  /**
   * Executar teste completo
   */
  runTests() {
    console.log('🧪 Executando testes...');

    const tests = [
      () => {
        console.log('✓ Test 1: Physics initialized');
        return window.gameManager?.physics !== undefined;
      },
      () => {
        console.log('✓ Test 2: Balls created');
        return window.gameManager?.physics?.balls?.length > 0;
      },
      () => {
        console.log('✓ Test 3: UI Manager exists');
        return window.uiManager !== undefined;
      },
      () => {
        console.log('✓ Test 4: Multiplayer Manager exists');
        return window.multiplayerManager !== undefined;
      },
      () => {
        console.log('✓ Test 5: Canvas initialized');
        return document.getElementById('gameCanvas') !== null;
      }
    ];

    let passed = 0;
    for (let test of tests) {
      if (test()) passed++;
    }

    console.log(`\n✅ ${passed}/${tests.length} testes passaram!`);
    return passed === tests.length;
  }

  /**
   * Medir performance
   */
  measurePerformance() {
    console.log('📊 Performance Metrics:');

    if (window.gameManager && window.gameManager.physics) {
      const physics = window.gameManager.physics;

      console.time('Physics Update');
      for (let i = 0; i < 100; i++) {
        physics.update();
      }
      console.timeEnd('Physics Update');

      console.log(`Balls: ${physics.balls.length}`);
      console.log(`Stationary: ${physics.areBallsStationary()}`);
      console.log(`Pockets: ${physics.pockets.length}`);
    }
  }

  /**
   * Ativar modo espectador
   */
  spectatorMode() {
    console.log('👁️ Modo Espectador ativado');
    if (window.gameManager) {
      window.gameManager.isAiming = false;
      // Apenas renderizar, sem interação
    }
  }

  /**
   * Teleportar bola branca
   */
  teleportCueBall(x, y) {
    if (window.gameManager && window.gameManager.physics) {
      window.gameManager.physics.repositionCueBall(x, y);
      console.log(`🎱 Bola branca teleportada para (${x}, ${y})`);
    }
  }

  /**
   * Criar velocidade na bola branca
   */
  applyCueVelocity(vx, vy) {
    if (window.gameManager && window.gameManager.physics) {
      const cueBall = window.gameManager.physics.getCueBall();
      if (cueBall) {
        cueBall.vx = vx;
        cueBall.vy = vy;
        console.log(`⚡ Velocidade aplicada: (${vx}, ${vy})`);
      }
    }
  }
}

// ===== INSTÂNCIA GLOBAL =====

const debugger = new GameDebugger();
window.debugger = debugger;

// ===== COMMANDS DO CONSOLE =====

console.log(`
🎱 NEON POOL - DEBUG CONSOLE

Comandos disponíveis:
  debugger.runTests()           - Executar testes
  debugger.listBalls()          - Listar bolas
  debugger.resetGame()          - Resetar jogo
  debugger.spawnBall()          - Criar nova bola
  debugger.measurePerformance()- Medir performance
  debugger.testCollisions()    - Testar colisões
  debugger.spectatorMode()     - Modo espectador
  debugger.teleportCueBall(x,y) - Teleportar cue ball
  debugger.applyCueVelocity(vx,vy) - Aplicar velocidade

Para desabilitar debug, edite este arquivo e mude 'enabled' para false.
`);

// ===== AUTO UPDATE DO PANEL =====

setInterval(() => {
  debugger.updateStats(window.gameManager);
}, 100);
