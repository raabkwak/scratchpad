const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const PADDLE_WIDTH = 14;
const PADDLE_HEIGHT = 90;
const PADDLE_MARGIN = 30;
const BALL_SIZE = 16;
const PADDLE_SPEED = 7;
const BASE_BALL_SPEED = 5;
const SPEED_INCREMENT = 0.4;
const WIN_SCORE = 10;

const keys = new Set();
let animationId;
let running = false;

const left = {
  x: PADDLE_MARGIN,
  y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  score: 0,
};

const right = {
  x: WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
  y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  score: 0,
};

const ball = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
  vx: BASE_BALL_SPEED,
  vy: BASE_BALL_SPEED * 0.5,
};

function resetBall(direction = 1) {
  ball.x = WIDTH / 2;
  ball.y = HEIGHT / 2;
  const angle = (Math.random() * Math.PI) / 3 - Math.PI / 6; // -30 to +30 deg
  const speed = BASE_BALL_SPEED + Math.random();
  ball.vx = speed * Math.cos(angle) * direction;
  ball.vy = speed * Math.sin(angle);
}

function clampPaddle(paddle) {
  paddle.y = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, paddle.y));
}

function update() {
  // Player input
  if (keys.has('KeyW')) left.y -= PADDLE_SPEED;
  if (keys.has('KeyS')) left.y += PADDLE_SPEED;
  if (keys.has('ArrowUp')) right.y -= PADDLE_SPEED;
  if (keys.has('ArrowDown')) right.y += PADDLE_SPEED;
  clampPaddle(left);
  clampPaddle(right);

  // Move ball
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Walls
  if (ball.y <= 0 || ball.y + BALL_SIZE >= HEIGHT) {
    ball.vy *= -1;
  }

  // Paddle collisions
  const collideLeft =
    ball.x <= left.x + PADDLE_WIDTH &&
    ball.x >= left.x &&
    ball.y + BALL_SIZE >= left.y &&
    ball.y <= left.y + PADDLE_HEIGHT;

  const collideRight =
    ball.x + BALL_SIZE >= right.x &&
    ball.x <= right.x + PADDLE_WIDTH &&
    ball.y + BALL_SIZE >= right.y &&
    ball.y <= right.y + PADDLE_HEIGHT;

  if (collideLeft || collideRight) {
    const paddle = collideLeft ? left : right;
    const relativeIntersectY = paddle.y + PADDLE_HEIGHT / 2 - (ball.y + BALL_SIZE / 2);
    const normalized = relativeIntersectY / (PADDLE_HEIGHT / 2);
    const bounceAngle = normalized * (Math.PI / 4); // 45° max
    const direction = collideLeft ? 1 : -1;
    const speed = Math.hypot(ball.vx, ball.vy) + SPEED_INCREMENT;

    ball.vx = direction * speed * Math.cos(bounceAngle);
    ball.vy = speed * -Math.sin(bounceAngle);
  }

  // Scoring
  if (ball.x < -BALL_SIZE) {
    right.score++;
    resetBall(-1);
  }
  if (ball.x > WIDTH + BALL_SIZE) {
    left.score++;
    resetBall(1);
  }

  draw();

  if (left.score >= WIN_SCORE || right.score >= WIN_SCORE) {
    running = false;
    announceWinner();
    return;
  }

  animationId = requestAnimationFrame(update);
}

function announceWinner() {
  const winner = left.score > right.score ? 'Left' : 'Right';
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, 0);
  gradient.addColorStop(0, '#3bfffe');
  gradient.addColorStop(1, '#ff00d8');

  ctx.fillStyle = '#000000aa';
  ctx.fillRect(0, HEIGHT / 2 - 60, WIDTH, 120);
  ctx.fillStyle = gradient;
  ctx.font = 'bold 48px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${winner} player wins!`, WIDTH / 2, HEIGHT / 2 + 15);
}

function drawNet() {
  ctx.strokeStyle = '#ffffff22';
  ctx.setLineDash([12, 18]);
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2, 0);
  ctx.lineTo(WIDTH / 2, HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawScore() {
  ctx.fillStyle = '#f7f4ff';
  ctx.font = '32px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(left.score, WIDTH / 2 - 80, 50);
  ctx.textAlign = 'right';
  ctx.fillText(right.score, WIDTH / 2 + 80, 50);
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawNet();

  // Glow around paddles and ball
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#3bfffe';
  ctx.fillStyle = '#3bfffe';
  ctx.fillRect(left.x, left.y, PADDLE_WIDTH, PADDLE_HEIGHT);

  ctx.shadowColor = '#ff00d8';
  ctx.fillRect(right.x, right.y, PADDLE_WIDTH, PADDLE_HEIGHT);

  ctx.shadowColor = '#fffca6';
  ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);
  ctx.shadowBlur = 0;

  drawScore();
}

function toggleGame() {
  if (running) {
    running = false;
    cancelAnimationFrame(animationId);
  } else {
    running = true;
    animationId = requestAnimationFrame(update);
  }
}

function resetGame() {
  left.score = 0;
  right.score = 0;
  left.y = right.y = HEIGHT / 2 - PADDLE_HEIGHT / 2;
  resetBall(Math.random() > 0.5 ? 1 : -1);
  draw();
}

window.addEventListener('keydown', (event) => {
  keys.add(event.code);
  if (event.code === 'Space') {
    toggleGame();
    event.preventDefault();
  }
  if (event.code === 'KeyR') {
    resetGame();
  }
});

window.addEventListener('keyup', (event) => {
  keys.delete(event.code);
});

resetGame();
