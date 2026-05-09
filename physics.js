/**
 * SISTEMA DE FÍSICA DE SINUCA
 * Simulação realista de colisões, atrito e movimento
 */

class PoolPhysics {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    // Configurações da física
    this.friction = 0.987; // Atrito do movimento
    this.angularFriction = 0.95; // Atrito angular (rotação)
    this.ballRadius = 10;
    this.ballMass = 1;
    this.restitution = 0.85; // Elasticidade nas colisões
    this.cueBallRestitution = 0.9;
    this.gravity = 0;

    // Bordas da mesa (com consideração ao raio da bola)
    this.tableMargin = 20;
    this.minX = this.tableMargin + this.ballRadius;
    this.maxX = this.width - this.tableMargin - this.ballRadius;
    this.minY = this.tableMargin + this.ballRadius;
    this.maxY = this.height - this.tableMargin - this.ballRadius;

    // Lista de bolas
    this.balls = [];

    // Sistema de pocket (buracos)
    this.pockets = [];
  }

  /**
   * Criar bola na física
   */
  createBall(x, y, id = 0, isCueBall = false) {
    const ball = {
      id: id,
      x: x,
      y: y,
      vx: 0,
      vy: 0,
      // Velocidade angular para efeitos de spin
      angularVelocity: 0,
      radius: this.ballRadius,
      mass: this.ballMass,
      isCueBall: isCueBall,
      sunk: false,
      lastX: x,
      lastY: y
    };
    this.balls.push(ball);
    return ball;
  }

  /**
   * Definir bolas em posição inicial
   */
  setupBalls(centerX, centerY) {
    // Limpar bolas anteriores
    this.balls = [];

    // Bola branca (cue ball)
    const whiteBall = this.createBall(centerX - 150, centerY, 0, true);

    // Bolas numeradas em triângulo
    const triangleX = centerX + 200;
    const triangleY = centerY;
    let ballId = 1;

    // Padrão triangular clássico
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col <= row; col++) {
        const x = triangleX + row * 22;
        const y = triangleY - (row * 20) + (col * 20);
        this.createBall(x, y, ballId, false);
        ballId++;
      }
    }
  }

  /**
   * Aplicar força à bola branca (tacada)
   */
  shootCueBall(power, angleX, angleY) {
    const cueBall = this.balls.find(b => b.isCueBall);
    if (!cueBall) return;

    // Normalizar direção
    const magnitude = Math.sqrt(angleX * angleX + angleY * angleY);
    if (magnitude === 0) return;

    const dirX = angleX / magnitude;
    const dirY = angleY / magnitude;

    // Aplicar velocidade baseada na força
    const velocity = power * 25; // Escalar para velocidade
    cueBall.vx = dirX * velocity;
    cueBall.vy = dirY * velocity;

    // Adicionar spin (rotação angular)
    cueBall.angularVelocity = power * 10;
  }

  /**
   * Atualizar posição das bolas
   */
  update(deltaTime = 0.016) {
    // Atualizar cada bola
    for (let ball of this.balls) {
      if (ball.sunk) continue;

      // Guardar posição anterior (para colisões)
      ball.lastX = ball.x;
      ball.lastY = ball.y;

      // Aplicar atrito
      ball.vx *= this.friction;
      ball.vy *= this.friction;
      ball.angularVelocity *= this.angularFriction;

      // Parar se muito lento
      if (Math.abs(ball.vx) < 0.01) ball.vx = 0;
      if (Math.abs(ball.vy) < 0.01) ball.vy = 0;
      if (Math.abs(ball.angularVelocity) < 0.001) ball.angularVelocity = 0;

      // Atualizar posição
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Colisão com bordas
      this.handleWallCollision(ball);

      // Verificar se caiu em buraco
      this.checkPocket(ball);
    }

    // Verificar colisões entre bolas
    this.checkBallCollisions();
  }

  /**
   * Colisão com as paredes da mesa
   */
  handleWallCollision(ball) {
    // Parede esquerda/direita
    if (ball.x - ball.radius < this.minX) {
      ball.x = this.minX;
      ball.vx *= -this.restitution;
    } else if (ball.x + ball.radius > this.maxX) {
      ball.x = this.maxX;
      ball.vx *= -this.restitution;
    }

    // Parede superior/inferior
    if (ball.y - ball.radius < this.minY) {
      ball.y = this.minY;
      ball.vy *= -this.restitution;
    } else if (ball.y + ball.radius > this.maxY) {
      ball.y = this.maxY;
      ball.vy *= -this.restitution;
    }
  }

  /**
   * Colisão entre bolas
   */
  checkBallCollisions() {
    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        const ball1 = this.balls[i];
        const ball2 = this.balls[j];

        if (ball1.sunk || ball2.sunk) continue;

        const dx = ball2.x - ball1.x;
        const dy = ball2.y - ball1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = ball1.radius + ball2.radius;

        if (distance < minDistance) {
          this.resolveCollision(ball1, ball2, distance, dx, dy, minDistance);
        }
      }
    }
  }

  /**
   * Resolver colisão entre duas bolas
   */
  resolveCollision(ball1, ball2, distance, dx, dy, minDistance) {
    // Normal da colisão
    const nx = dx / distance;
    const ny = dy / distance;

    // Velocidade relativa
    const dvx = ball2.vx - ball1.vx;
    const dvy = ball2.vy - ball1.vy;

    // Velocidade relativa na normal
    const dvn = dvx * nx + dvy * ny;

    // Não processar se bolas estão se afastando
    if (dvn >= 0) return;

    // Restitução
    const restitution = this.restitution;

    // Impulso
    let impulse = -(1 + restitution) * dvn / (1 / ball1.mass + 1 / ball2.mass);

    // Aplicar impulso
    ball1.vx -= impulse * nx / ball1.mass;
    ball1.vy -= impulse * ny / ball1.mass;
    ball2.vx += impulse * nx / ball2.mass;
    ball2.vy += impulse * ny / ball2.mass;

    // Separar bolas que estão muito próximas
    const overlap = (minDistance - distance) / 2;
    ball1.x -= overlap * nx;
    ball1.y -= overlap * ny;
    ball2.x += overlap * nx;
    ball2.y += overlap * ny;
  }

  /**
   * Configurar buracos (pockets)
   */
  setupPockets(width, height) {
    this.pockets = [
      // Cantos
      { x: this.tableMargin, y: this.tableMargin, radius: 25 },
      { x: width - this.tableMargin, y: this.tableMargin, radius: 25 },
      { x: this.tableMargin, y: height - this.tableMargin, radius: 25 },
      { x: width - this.tableMargin, y: height - this.tableMargin, radius: 25 },
      // Lados
      { x: width / 2, y: this.tableMargin, radius: 22 },
      { x: width / 2, y: height - this.tableMargin, radius: 22 }
    ];
  }

  /**
   * Verificar se bola caiu em buraco
   */
  checkPocket(ball) {
    for (let pocket of this.pockets) {
      const dx = ball.x - pocket.x;
      const dy = ball.y - pocket.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < pocket.radius) {
        ball.sunk = true;
        ball.vx = 0;
        ball.vy = 0;
        return true;
      }
    }
    return false;
  }

  /**
   * Reposicionar bola branca após falta
   */
  repositionCueBall(x, y) {
    const cueBall = this.balls.find(b => b.isCueBall);
    if (cueBall) {
      cueBall.x = x;
      cueBall.y = y;
      cueBall.vx = 0;
      cueBall.vy = 0;
      cueBall.angularVelocity = 0;
      cueBall.sunk = false;
    }
  }

  /**
   * Resetar todas as velocidades
   */
  stopAllBalls() {
    for (let ball of this.balls) {
      ball.vx = 0;
      ball.vy = 0;
      ball.angularVelocity = 0;
    }
  }

  /**
   * Verificar se todas as não-brancas estão paradas
   */
  areBallsStationary(threshold = 0.1) {
    for (let ball of this.balls) {
      if (ball.sunk) continue;
      const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      if (speed > threshold) return false;
    }
    return true;
  }

  /**
   * Obter bola branca
   */
  getCueBall() {
    return this.balls.find(b => b.isCueBall);
  }

  /**
   * Obter posição de uma bola
   */
  getBallPosition(id) {
    const ball = this.balls.find(b => b.id === id);
    return ball ? { x: ball.x, y: ball.y } : null;
  }

  /**
   * Serializar estado das bolas para multiplayer
   */
  serialize() {
    return this.balls.map(ball => ({
      id: ball.id,
      x: Math.round(ball.x),
      y: Math.round(ball.y),
      vx: Math.round(ball.vx * 100) / 100,
      vy: Math.round(ball.vy * 100) / 100,
      sunk: ball.sunk
    }));
  }

  /**
   * Desserializar estado das bolas
   */
  deserialize(data) {
    for (let ballData of data) {
      const ball = this.balls.find(b => b.id === ballData.id);
      if (ball) {
        ball.x = ballData.x;
        ball.y = ballData.y;
        ball.vx = ballData.vx;
        ball.vy = ballData.vy;
        ball.sunk = ballData.sunk;
      }
    }
  }

  /**
   * Reset do jogo
   */
  reset() {
    this.balls = [];
  }
}
/* =========================
   CONFIGURAÇÕES DA MESA
========================= */

const TABLE = {

  x: 170,

  y: 120,

  width: 1000,

  height: 540,

  pocketRadius: 30,

  cushionBounce: 0.97,

  friction: 0.004,

  airFriction: 0.012

};

/* =========================
   CONFIGURAÇÕES DAS BOLAS
========================= */

const BALL = {

  radius: 15,

  glowRadius: 19

};

/* =========================
   FORÇA DO TACO
========================= */

const POWER = {

  min: 0.01,

  max: 0.08,

  default: 0.02

};

/* =========================
   FUNÇÃO:
   CRIAR COLISÕES DA MESA
========================= */

function createTablePhysics(scene){

  /* ESQUERDA */

  scene.matter.add.rectangle(

    TABLE.x,

    TABLE.y + TABLE.height / 2,

    20,

    TABLE.height,

    {

      isStatic: true,

      restitution: TABLE.cushionBounce

    }

  );

  /* DIREITA */

  scene.matter.add.rectangle(

    TABLE.x + TABLE.width,

    TABLE.y + TABLE.height / 2,

    20,

    TABLE.height,

    {

      isStatic: true,

      restitution: TABLE.cushionBounce

    }

  );

  /* TOPO */

  scene.matter.add.rectangle(

    TABLE.x + TABLE.width / 2,

    TABLE.y,

    TABLE.width,

    20,

    {

      isStatic: true,

      restitution: TABLE.cushionBounce

    }

  );

  /* BAIXO */

  scene.matter.add.rectangle(

    TABLE.x + TABLE.width / 2,

    TABLE.y + TABLE.height,

    TABLE.width,

    20,

    {

      isStatic: true,

      restitution: TABLE.cushionBounce

    }

  );

}

/* =========================
   FUNÇÃO:
   APLICAR FÍSICA NA BOLA
========================= */

function applyBallPhysics(ball){

  ball.setCircle(BALL.radius);

  ball.setBounce(TABLE.cushionBounce);

  ball.setFriction(TABLE.friction);

  ball.setFrictionAir(TABLE.airFriction);

}

/* =========================
   FUNÇÃO:
   VERIFICAR MOVIMENTO
========================= */

function isBallMoving(ball){

  return (

    Math.abs(ball.body.velocity.x) > 0.05 ||

    Math.abs(ball.body.velocity.y) > 0.05

  );

}

/* =========================
   FUNÇÃO:
   VERIFICAR SE TODAS
   AS BOLAS PARARAM
========================= */

function areBallsStopped(balls){

  let moving = false;

  balls.forEach(ball => {

    if(isBallMoving(ball)){

      moving = true;

    }

  });

  return !moving;

}

/* =========================
   FUNÇÃO:
   DISTÂNCIA ENTRE OBJETOS
========================= */

function getDistance(x1,y1,x2,y2){

  return Phaser.Math.Distance.Between(

    x1,
    y1,

    x2,
    y2

  );

}

/* =========================
   FUNÇÃO:
   VERIFICAR BURACO
========================= */

function isBallInsidePocket(ball,pocket){

  const dist = getDistance(

    ball.x,
    ball.y,

    pocket.x,
    pocket.y

  );

  return dist < TABLE.pocketRadius - 6;

}

/* =========================
   FUNÇÃO:
   APLICAR FORÇA
========================= */

function applyShotForce(

  ball,

  angle,

  power

){

  ball.applyForce({

    x: Math.cos(angle) * power,

    y: Math.sin(angle) * power

  });

}

/* =========================
   FUNÇÃO:
   LIMITAR FORÇA
========================= */

function clampPower(power){

  return Phaser.Math.Clamp(

    power,

    POWER.min,

    POWER.max

  );

}

/* =========================
   FUNÇÃO:
   RESETAR BOLA BRANCA
========================= */

function resetWhiteBall(ball){

  ball.setPosition(

    420,

    390

  );

  ball.setVelocity(0,0);

}

/* =========================
   FUNÇÃO:
   EFEITO AO CAIR
========================= */

function pocketAnimation(

  scene,

  ball

){

  scene.tweens.add({

    targets:[

      ball.circle,

      ball.glow,

      ball.text

    ],

    scale:0,

    alpha:0,

    duration:250,

    ease:'Power2'

  });

}

/* =========================
   FUNÇÃO:
   REMOVER BOLA
========================= */

function removeBall(ball){

  ball.setPosition(

    -999,

    -999

  );

  ball.pocketed = true;

}

/* =========================
   FUNÇÃO:
   SOM DE COLISÃO
========================= */

function playHitSound(){

  console.log('hit');

}

/* =========================
   FUNÇÃO:
   SOM DE BURACO
========================= */

function playPocketSound(){

  console.log('pocket');

}

/* =========================
   FUNÇÃO:
   VIBRAÇÃO MOBILE
========================= */

function mobileVibration(){

  if(navigator.vibrate){

    navigator.vibrate(30);

  }

}