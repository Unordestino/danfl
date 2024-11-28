const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let birdX = 50;
let birdY = 200;
let birdDY = 0;
const gravity = 0.5;
const jump = -10;

let pipes = [];
const pipeWidth = 50;
const pipeGap = 150;
const pipeSpeed = 2;

let score = 0;
let gameOver = false;
let gameStarted = false;

let playerName = "";

// Carregar imagem do pássaro
const birdImg = new Image();
birdImg.src = "https://i.ibb.co/HTZVkJz/Whats-App-Image-2024-11-28-at-10-01-30.jpg";

// Carregar os áudios
const jumpSound = document.getElementById("jumpSound");
const gameOverSound = document.getElementById("gameOverSound");

// Função para iniciar o jogo
function startGame() {
  playerName = prompt("Enter your name:");
  gameStarted = true;
  resetGame();
  createPipe();
  updateLeaderboard();
}

// Função para reiniciar o jogo
function resetGame() {
  birdX = 50;
  birdY = 200;
  birdDY = 0;
  pipes = [];
  score = 0;
  gameOver = false;
  document.getElementById("gameOver").style.display = "none";
  document.getElementById("startScreen").style.display = "none";
}

// Função para criar obstáculos (tubos)
function createPipe() {
  const pipeHeight = Math.random() * (canvas.height - pipeGap - 50) + 50;
  pipes.push({
    x: canvas.width,
    top: pipeHeight,
    bottom: pipeHeight + pipeGap,
  });
}

// Função para salvar a pontuação
function saveScore() {
  fetch("http://10.180.0.219:3000/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: playerName, score: score }),
  })
  .then(response => response.json())
  .then(data => {
    console.log("Score saved", data);
    updateLeaderboard(); // Atualiza o placar após salvar
  })
  .catch(error => console.error("Error saving score", error));
}

// Função para atualizar o Top 10
function updateLeaderboard() {
  fetch("http://10.180.0.219:3000/scores")
    .then(response => response.json())
    .then(data => {
      const leaderboard = document.getElementById("scoreList");
      leaderboard.innerHTML = ""; // Limpa a lista atual

      // Preenche a lista com os novos dados
      data.forEach((score, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${score.name} - ${score.score}`;
        leaderboard.appendChild(li);
      });
    })
    .catch(error => console.error("Error fetching leaderboard", error));
}

// Função para desenhar tudo no canvas
function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Desenha o pássaro
  ctx.drawImage(birdImg, birdX, birdY, 30, 30);

  // Desenha os tubos
  pipes.forEach(pipe => {
    ctx.fillStyle = "#3e8914";
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
  });

  // Desenha a pontuação
  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);

  if (!gameStarted) {
    ctx.fillStyle = "#000";
    ctx.font = "30px Arial";
    ctx.fillText("Press Space to Start", 70, canvas.height / 2);
  }

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over!", canvas.width / 4, canvas.height / 2 - 30);
    ctx.fillStyle = "#000";
    ctx.font = "20px Arial";
    ctx.fillText("Press Space to Restart", 100, canvas.height / 2 + 20);
    saveScore();
  }
}

// Função para atualizar o estado do jogo
function updateGame() {
  if (!gameStarted || gameOver) return;

  birdDY += gravity;
  birdY += birdDY;

  pipes.forEach((pipe, index) => {
    pipe.x -= pipeSpeed;

    // Verifica colisões
    if (
      birdX + 30 > pipe.x && birdX < pipe.x + pipeWidth &&
      (birdY < pipe.top || birdY + 30 > pipe.bottom)
    ) {
      gameOver = true;
    }

    if (pipe.x + pipeWidth < 0) {
      pipes.splice(index, 1);
      score++;
    }
  });

  if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
    createPipe();
  }

  if (birdY + 30 > canvas.height) {
    birdY = canvas.height - 30;
    birdDY = 0;
  }

  drawGame();
}

// Função de evento de pulo
function jumpBird() {
  if (gameOver) {
    resetGame();
  } else if (gameStarted) {
    birdDY = jump;
    jumpSound.play();  // Toca o som do pulo
  }
}

// Função para tratar pressionamento de teclas
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (!gameStarted) startGame();
    jumpBird();
  }
});

// Função de loop de animação
function gameLoop() {
  updateGame();
  if (gameOver) {
    gameOverSound.play();  // Toca o som do game over
  }
  requestAnimationFrame(gameLoop);
}

gameLoop();
