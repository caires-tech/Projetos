// ===============================
// SETUP DO CANVAS
// ===============================
const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===============================
// CONFIGURAÇÃO DE GRID
// ===============================
const fontSize = 18;
const horizontalScale = 0.85;
const hSpacing = fontSize * horizontalScale;

const cols = Math.floor(canvas.width / hSpacing);
const rows = Math.floor(canvas.height / fontSize);

ctx.font = "bold " + fontSize + "px monospace";
ctx.textBaseline = "top";

// ===============================
// CARACTERES
// ===============================
const letters =
  "アイウエオカキクケコサシスセソタチツテトナニヌネハヒフヘホABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789WZMHKYあいうえおかきくけこさしすせそたちつてとなにぬねはひふへほ";
const lettersArray = letters.split("");

// ===============================
// ESTRUTURAS PRINCIPAIS (GRIDS)
// ===============================
const grid = [];
const flipGrid = [];

for (let y = 0; y < rows; y++) {
  grid[y] = [];
  flipGrid[y] = [];
  for (let x = 0; x < cols; x++) {
    grid[y][x] = lettersArray[Math.floor(Math.random() * lettersArray.length)];
    flipGrid[y][x] = Math.random() < 0.08; // 8% de chance de inversão fixa
  }
}

// ===============================
// FEIXES (DENSIDADE EQUILIBRADA)
// ===============================
const beams = [];
for (let x = 0; x < cols; x++) {
  beams[x] = [];
  // 1 ou 2 feixes por coluna para preencher bem a tela
  const beamCount = Math.floor(Math.random() * 2) + 1;

  for (let b = 0; b < beamCount; b++) {
    beams[x].push({
      head: -Math.random() * rows * 1.5,
      speed: 0.25 + Math.random() * 0.45,
      length: 15 + Math.random() * 20,
    });
  }
}

// ===============================
// FUNÇÃO PRINCIPAL DE DESENHO
// ===============================
function draw(deltaTime = 1) {
  ctx.fillStyle = "black";
  ctx.shadowBlur = 0;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Atualização de caracteres aleatórios (Leve)
  for (let i = 0; i < cols * 5; i++) {
    const rx = Math.floor(Math.random() * cols);
    const ry = Math.floor(Math.random() * rows);
    if (Math.random() < 0.1) {
      grid[ry][rx] =
        lettersArray[Math.floor(Math.random() * lettersArray.length)];
    }
  }

  for (let x = 0; x < cols; x++) {
    for (let beam of beams[x]) {
      for (let j = 0; j < beam.length; j++) {
        const y = Math.floor(beam.head - j);

        if (y >= 0 && y < rows) {
          const char = grid[y][x];
          const t = j / beam.length;
          const alpha = Math.pow(1 - t, 2.3);

          // --- LÓGICA DE ESTILO REALISTA ---
          if (j === 0) {
            // CABEÇA: Brilho Máximo (Efeito Neon)
            ctx.shadowColor = "rgba(180, 255, 180, 1)";
            ctx.shadowBlur = 25;
            ctx.fillStyle = "white";
          } else if (j < 5) {
            // TRANSIÇÃO: Ainda mantém brilho para não ficar "flat"
            ctx.shadowColor = "rgba(0, 255, 70, 0.6)";
            ctx.shadowBlur = 12;
            ctx.fillStyle = `rgba(140, 255, 170, ${alpha})`;
          } else {
            // RASTRO: Sem brilho (Alta Performance)
            ctx.shadowBlur = 0;
            const green = 130 + Math.random() * 70;
            ctx.fillStyle = `rgba(0, ${green}, 70, ${alpha})`;
          }

          // LÓGICA DE INVERSÃO (FLIP) - CENTRALIZADA
          if (flipGrid[y][x] || (j === 0 && Math.random() < 0.05)) {
            ctx.save();
            ctx.translate(
              x * hSpacing + hSpacing / 2,
              y * fontSize + fontSize / 2,
            );
            if ((x + y) % 2 === 0) ctx.scale(-1, 1);
            else ctx.scale(1, -1);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(char, 0, 0);
            ctx.restore();
            // Reset de estado para o próximo caractere
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
          } else {
            ctx.fillText(char, x * hSpacing, y * fontSize);
          }
        }
      }

      // Movimentação Sincronizada
      beam.head += beam.speed * deltaTime;

      if (beam.head - beam.length > rows) {
        beam.head = -Math.random() * 5;
        beam.speed = 0.25 + Math.random() * 0.45;
      }
    }
  }
}

// ===============================
// LOOP DE ANIMAÇÃO (SINCRONIZADO)
// ===============================
const targetFPS = 30; // Garante a mesma velocidade no iPad e no PC
const frameDuration = 1000 / targetFPS;
let lastTimestamp = 0;
let accumulator = 0;

function animate(currentTime) {
  if (!lastTimestamp) lastTimestamp = currentTime;
  const elapsed = currentTime - lastTimestamp;
  lastTimestamp = currentTime;
  accumulator += elapsed;

  while (accumulator >= frameDuration) {
    draw(1);
    accumulator -= frameDuration;
  }
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

// ===============================
// RESPONSIVIDADE
// ===============================
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
