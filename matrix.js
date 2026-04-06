// ===============================
// --- SETUP DO CANVAS ---
// ===============================
const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// DETECÇÃO DE SAFARI (Bifurcação de visual)
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

// Valores originais (Chrome/Windows/Android)
let fontSize = 18;
let horizontalScale = 0.85;

// Ajuste fino para manter a fidelidade no Safari (Mac/iOS)
if (isSafari) {
  fontSize = 17;
  horizontalScale = 0.94;
}

const hSpacing = fontSize * horizontalScale;
const cols = Math.floor(canvas.width / hSpacing);
const rows = Math.floor(canvas.height / fontSize);

ctx.font = isSafari
  ? "bold " + fontSize + "px 'Courier New', Courier, monospace"
  : "bold " + fontSize + "px monospace";

ctx.textBaseline = "top";

const letters =
  "アイウエオカキクケコサシスセソタチツテトナニヌネハヒフヘホABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789WZMHKYあいうえおかきくけこさしす세소たちつてとなにぬねはひふへほアイウエカキクケコサシスセソタチツテトナニヌネハヒフヘホあいうえおかきくけこさしすせそ";
const lettersArray = letters.split("");

// ===============================
// --- ESTRUTURAS PRINCIPAIS ---
// ===============================
const grid = [];
const lockGrid = [];
const changeSpeedGrid = [];
const flipGrid = [];

for (let y = 0; y < rows; y++) {
  grid[y] = [];
  lockGrid[y] = [];
  changeSpeedGrid[y] = [];
  flipGrid[y] = [];
  for (let x = 0; x < cols; x++) {
    grid[y][x] = lettersArray[Math.floor(Math.random() * lettersArray.length)];
    lockGrid[y][x] = 0;
    flipGrid[y][x] = Math.random() < 0.1;
    changeSpeedGrid[y][x] = 0.07 + Math.random() * 0.1;
  }
}
// ===============================
// --- FEIXES INICIAIS ---
// ===============================
const beams = [];
for (let x = 0; x < cols; x++) {
  beams[x] = [];
  if (Math.random() < 0.6) {
    // DENSIDADE INICIAL
    beams[x].push({
      head: -Math.random() * rows * 1.5,
      speed: 0.25 + Math.random() * 0.5,
      length:
        Math.random() < 0.15
          ? rows * (1.2 + Math.random() * 0.5)
          : 20 + Math.random() * 25,
    });
  }
}

// ===============================
// --- FUNÇÃO DE DESENHO ---
// ===============================
function draw(deltaTime = 1) {
  ctx.shadowBlur = 0;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Atualização da grid
  for (let i = 0; i < cols * 7; i++) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    let changeChance = changeSpeedGrid[y][x];
    if (lockGrid[y][x] > 0) {
      lockGrid[y][x]--;
      changeChance *= 0.6;
    }
    if (Math.random() < changeChance) {
      grid[y][x] =
        lettersArray[Math.floor(Math.random() * lettersArray.length)];
    }
  }

  for (let x = 0; x < cols; x++) {
    for (let beam of beams[x]) {
      for (let j = 0; j < beam.length; j++) {
        if (j > 40) break;
        const y = Math.floor(beam.head - j);
        if (y >= 0 && y < rows) {
          const char = grid[y][x];
          const alpha = Math.pow(1 - j / beam.length, 2.5);

          // ===============================
          // --- RASTRO VERDE ---
          // ===============================
          ctx.fillStyle = `rgba(0, 255, 70, ${alpha * 0.1})`;
          ctx.shadowBlur = 0;

          const flip = Math.random() < 0.15;
          if (flip || flipGrid[y][x]) {
            ctx.save();
            ctx.translate(
              x * hSpacing + hSpacing / 2,
              y * fontSize + fontSize / 2,
            );
            if (flip) {
              if (Math.random() < 0.5) ctx.scale(-1, 1);
              else ctx.scale(1, -1);
            } else {
              if ((x + y) % 2 === 0) ctx.scale(-1, 1);
              else ctx.scale(1, -1);
            }
            ctx.fillText(char, -hSpacing / 2, -fontSize / 2);
            ctx.restore();
          } else {
            ctx.fillText(char, x * hSpacing, y * fontSize);
          }

          if (j < 2) lockGrid[y][x] = 10 + Math.random() * 15;

          // ===============================
          // --- 3 CAMADAS NO FEIXE ---
          // ===============================

          if (j === 0) {
            const speedFactor = beam.speed;
            const intensity = 0.8 + Math.random() * 0.4;

            // Bloom externo
            ctx.shadowColor = `rgba(180,255,180,${intensity})`;
            ctx.shadowBlur = 40 + speedFactor * 15;
            ctx.fillStyle = "rgba(255,255,255,0.6)";
            ctx.fillText(char, x * hSpacing, y * fontSize);

            // Camada média
            ctx.shadowColor = "rgba(180,255,180,0.8)";
            ctx.shadowBlur = 20 + speedFactor * 10;
            ctx.fillStyle = "rgba(255,255,255,0.8)";
            ctx.fillText(char, x * hSpacing, y * fontSize);

            // Núcleo
            ctx.shadowColor = "rgba(220,255,220,1)";
            ctx.shadowBlur = 10 + speedFactor * 5;
            ctx.fillStyle = "rgba(255,255,255,1)";
            ctx.fillText(char, x * hSpacing, y * fontSize);
            continue;
          } else if (j === 1) {
            const green = 180 + Math.random() * 50;
            ctx.fillStyle = `rgba(${green * 0.6}, ${green}, ${green * 0.4}, ${alpha})`;
            ctx.shadowColor = `rgba(120, 255, 180, ${alpha})`;
            ctx.shadowBlur = 18;
          } else {
            const green = 120 + Math.random() * 80;
            ctx.fillStyle = `rgba(${green * 0.2}, ${green}, ${green * 0.1}, ${alpha})`;
            ctx.shadowBlur = 0;
          }
          ctx.fillText(char, x * hSpacing, y * fontSize);
        }
      }
      beam.head += beam.speed * deltaTime;
      if (beam.head - beam.length > rows) {
        beam.head = -Math.random() * rows;
        beam.speed = 0.25 + Math.random() * 0.5;
      }
    }
    // ===============================
    // --- CONTROLE DE DENSIDADE ---
    // ===============================

    if (Math.random() < 0.04 && beams[x].length < 1) {
      beams[x].push({
        head: -10,
        speed: 0.25 + Math.random() * 0.5,
        length: 25 + Math.random() * 35,
      });
    }
  }
}

// ===============================
// --- LOOP DE ANIMAÇÃO ---
// ===============================
const targetFPS = 30;
const frameDuration = 1000 / targetFPS;
let lastTimestamp = 0;
let accumulator = 0;

function animate(currentTime) {
  if (!lastTimestamp) lastTimestamp = currentTime;
  let elapsed = currentTime - lastTimestamp;
  lastTimestamp = currentTime;
  if (elapsed > 1000) elapsed = frameDuration;
  accumulator += elapsed;
  if (accumulator > frameDuration * 2) accumulator = frameDuration * 2;
  while (accumulator >= frameDuration) {
    draw(1);
    accumulator -= frameDuration;
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
