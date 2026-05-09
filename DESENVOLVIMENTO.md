# 🛠️ Guia de Desenvolvimento

## Customizar o Jogo

### Mudar Cores Neon

No arquivo `style.css`, procure por `:root`:

```css
:root {
  --primary-neon: #00ff88;      /* Verde neon */
  --secondary-neon: #ff00ff;    /* Rosa/Magenta */
  --tertiary-neon: #00ffff;     /* Ciano */
  --warn-neon: #ff4400;         /* Laranja */
}
```

Exemplo de cores alternativas:
```css
/* Cyberpunk azul */
--primary-neon: #00d4ff;
--secondary-neon: #c000ff;
--tertiary-neon: #ff006e;

/* Retro arcade */
--primary-neon: #ffff00;
--secondary-neon: #ff00ff;
--tertiary-neon: #00ffff;

/* Dark mode */
--primary-neon: #39ff14;
--secondary-neon: #ff006e;
--tertiary-neon: #0080ff;
```

### Mudar Velocidade da Física

Em `physics.js`:

```javascript
class PoolPhysics {
  constructor() {
    this.friction = 0.987;        // ↓ menor = mais rápido
    this.restitution = 0.85;      // ↑ maior = mais rebote
    this.ballRadius = 10;         // Tamanho da bola
  }
}
```

Exemplos:
- **Rápido**: friction = 0.99, restitution = 0.9
- **Lento**: friction = 0.97, restitution = 0.8
- **Arcade**: friction = 0.998, restitution = 0.95

### Mudar Número de Bolas

Em `physics.js`, método `setupBalls()`:

```javascript
// Padrão atual: 4 linhas = 15 bolas
for (let row = 0; row < 5; row++) {  // ← Mude para mais/menos

// Exemplos:
// row < 3: 6 bolas (triângulo pequeno)
// row < 4: 10 bolas
// row < 5: 15 bolas (padrão)
// row < 6: 21 bolas
```

### Adicionar Soundeffects

No `script.js`:

```javascript
class PoolGame {
  playSound(name) {
    const audio = new Audio(`sounds/${name}.mp3`);
    audio.volume = 0.5;
    audio.play();
  }

  shootCue() {
    // ... código
    this.playSound('cue-hit');
  }

  drawBall() {
    // Ao colidir
    this.playSound('ball-hit');
  }
}
```

Crie pasta `sounds/` com:
- `cue-hit.mp3` - Som da tacada
- `ball-hit.mp3` - Som de colisão
- `ball-pocket.mp3` - Som de bola caindo
- `win.mp3` - Som de vitória

### Adicionar Múltiplos Idiomas

Crie arquivo `i18n.js`:

```javascript
const translations = {
  'pt-BR': {
    'play': 'Jogar',
    'training': 'Treino',
    'score': 'Placar'
  },
  'en-US': {
    'play': 'Play',
    'training': 'Training',
    'score': 'Score'
  },
  'es-ES': {
    'play': 'Jugar',
    'training': 'Entrenamiento',
    'score': 'Puntuación'
  }
};

function translate(key, lang = 'pt-BR') {
  return translations[lang]?.[key] || key;
}
```

No HTML:
```html
<button id="btnPlay">
  <!-- [i18n: play] -->
</button>
```

### Adicionar IA

Em `script.js`:

```javascript
class AIPlayer {
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty;
  }

  calculateShot() {
    // Análise de bolas alvo
    // Cálculo de ângulo
    // Seleção de força (com erro aleatório)
    return { angle, power };
  }

  makeBestMove() {
    const shot = this.calculateShot();
    this.shootCue(shot.power, shot.angle.x, shot.angle.y);
  }
}
```

### Adicionar Atributos ao Taco

```javascript
class CueStick {
  constructor(type = 'standard') {
    this.stats = {
      'standard': { power: 1.0, precision: 1.0 },
      'power': { power: 1.3, precision: 0.8 },
      'precision': { power: 0.9, precision: 1.3 }
    }[type];
  }

  apply(power, angle) {
    const modifiedPower = power * this.stats.power;
    const modifiedAngle = angle * this.stats.precision;
    return { modifiedPower, modifiedAngle };
  }
}
```

## Estrutura de Dados de Persistência

Usar LocalStorage:

```javascript
class GameData {
  save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  load(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  clear(key) {
    localStorage.removeItem(key);
  }
}

// Uso
const gameData = new GameData();
gameData.save('playerProfile', {
  name: 'João',
  level: 10,
  coins: 5000
});

const profile = gameData.load('playerProfile');
```

## Adicionar Analytics

```javascript
class Analytics {
  trackEvent(eventName, data = {}) {
    console.log(`📊 Event: ${eventName}`, data);
    // Enviar para Google Analytics
    gtag?.('event', eventName, data);
  }

  trackGameStart() {
    this.trackEvent('game_start', { mode: this.gameMode });
  }

  trackGameEnd(winner, duration) {
    this.trackEvent('game_end', { winner, duration });
  }
}
```

## Performance Tips

### Otimização de Renderização

```javascript
// Usar OffscreenCanvas
const offscreenCanvas = new OffscreenCanvas(width, height);
const ctx = offscreenCanvas.getContext('2d');

// Pré-renderizar elementos estáticos
this.prerenderedBalls = [];

// Cache de imagens
this.textureCache = new Map();
```

### Reduzir Cálculos

```javascript
// Usar quadtree para colisões
class Quadtree {
  find(bounds) {
    // Retorna apenas objetos nas vizinhanças
  }
}

// Frame skip
if (frameCount % 2 === 0) {
  // Cálculos pesados
}
```

## Debugging

### Console Logging

```javascript
// Ativar/desativar debug
const DEBUG = true;

function log(message, data = {}) {
  if (DEBUG) {
    console.log(`🎱 ${message}`, data);
  }
}
```

### DevTools Dicas

F12 → Console:
```javascript
// Ver FPS
setInterval(() => {
  console.log('FPS: ' + performance.now());
}, 1000);

// Monitor performance
console.time('Physics Loop');
physics.update();
console.timeEnd('Physics Loop');
```

## Testes

Com Jest:

```javascript
// physics.test.js
describe('PoolPhysics', () => {
  test('colisão entre bolas', () => {
    const physics = new PoolPhysics(800, 600);
    physics.createBall(0, 0);
    physics.createBall(20, 0);
    // ...
    expect(ball1.vx).toBeLessThan(0);
  });
});
```

## Deploy Melhorado

### Minify e Otimizar

```bash
# Instalar ParcelJS
npm install -g parcel-bundler

# Build
parcel build index.html

# Resultado em dist/
```

### Usar CDN

```html
<!-- index.html -->
<script src="https://cdn.jsdelivr.net/npm/firebase@10/dist/firebase.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/neon-ui@1/dist/neon.min.css">
```

## Próximas Funcionalidades

- [ ] Spectator mode
- [ ] Replays de jogadas
- [ ] Torneios automáticos
- [ ] Bot progressivo
- [ ] Modos de jogo (9-ball, snooker)
- [ ] Achievements
- [ ] Leaderboard semanal
- [ ] Streaming integrado

Boa sorte desenvolvendo! 🚀
