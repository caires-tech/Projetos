// ===============================
// SETUP DO CANVAS
// ===============================
const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

// ocupa a tela inteira
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===============================
// CONFIGURAÇÃO DE GRID
// ===============================
const fontSize = 18;

// reduz o espaçamento horizontal
const horizontalScale = 0.85;
const hSpacing = fontSize * horizontalScale;

// quantidade de colunas e linhas na tela
const cols = Math.floor(canvas.width / hSpacing);
const rows = Math.floor(canvas.height / fontSize);

// fonte usada
ctx.font = "bold " + fontSize + "px monospace";
ctx.textBaseline = "top";

// ===============================
// CARACTERES
// ===============================
const letters =
  "アイウエオカキクケコサシスセソタチツテトナニヌネハヒフヘホABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789WZMHKYあいうえおかきくけこさしすせそたちつてとなにぬねはひふへほアイウエカキクケコサシスセソタチツテトナニヌネハヒフヘホあいうえおかきくけこさしすせそ";

const lettersArray = letters.split("");

// ===============================
// ESTRUTURAS PRINCIPAIS (GRIDS)
// ===============================

// caractere exibido em cada posição
const grid = [];

// controla "travamento" de caracteres iluminados (efeito glow estável)
const lockGrid = [];

// velocidade individual de troca de cada célula
const changeSpeedGrid = [];

// define quais células terão efeito de inversão (flip)
const flipGrid = [];

// inicialização das grids
for (let y = 0; y < rows; y++) {
  grid[y] = [];
  lockGrid[y] = [];
  changeSpeedGrid[y] = [];
  flipGrid[y] = [];

  for (let x = 0; x < cols; x++) {
    // caractere aleatório inicial
    grid[y][x] = lettersArray[Math.floor(Math.random() * lettersArray.length)];

    // sem trava inicialmente
    lockGrid[y][x] = 0;

    // 10% dos caracteres terão efeito invertido
    flipGrid[y][x] = Math.random() < 0.1;

    // cada célula tem sua própria velocidade de troca
    changeSpeedGrid[y][x] = 0.09 + Math.random() * 0.15;
  }
}

// ===============================
// FEIXES
// ===============================

// cada coluna pode ter até 2 feixes independentes
const beams = [];

for (let x = 0; x < cols; x++) {
  beams[x] = [];

  // 1 ou 2 feixes por coluna
  const beamCount = Math.floor(Math.random() * 3) + 2;

  for (let b = 0; b < beamCount; b++) {
    beams[x].push({
      // posição inicial (começa fora da tela)
      head: -Math.random() * rows * 1.5,

      // velocidade de descida
      speed: 0.3 + Math.random() * 0.6, //CONTROLE DE VELOCIDADE

      // tamanho do feixe variável
      length:
        Math.random() < 0.15
          ? rows * (0.7 + Math.random() * 0.6)
          : 15 + Math.random() * 25,
    });
  }
}

// ===============================
// FUNÇÃO PRINCIPAL DE DESENHO
// ===============================
function draw(deltaTime = 1) {
  // limpa a tela com fundo preto
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ===========================
  // ATUALIZAÇÃO DOS CARACTERES
  // ===========================

  // atualiza apenas parte da grid por frame
  for (let i = 0; i < cols * 15; i++) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);

    let changeChance = changeSpeedGrid[y][x];

    // caracteres "congelados" trocam menos (efeito de brilho persistente)
    if (lockGrid[y][x] > 0) {
      lockGrid[y][x]--;
      changeChance *= 0.8;
    }

    // troca aleatória de caractere
    if (Math.random() < changeChance) {
      grid[y][x] =
        lettersArray[Math.floor(Math.random() * lettersArray.length)];
    }
  }

  // ===========================
  // DESENHO DOS FEIXES
  // ===========================
  for (let x = 0; x < cols; x++) {
    for (let beam of beams[x]) {
      for (let j = 0; j < beam.length; j++) {
        // limita o tamanho visual do rastro
        if (j > 40) break;

        const y = Math.floor(beam.head - j);

        if (y >= 0 && y < rows) {
          const char = grid[y][x];

          // intensidade do fade do rastro
          const t = j / beam.length;
          const alpha = Math.pow(1 - t, 2.5);

          // =======================
          // RASTRO VERDE
          // =======================
          ctx.fillStyle = `rgba(0, 255, 70, ${alpha * 0.1})`;
          ctx.shadowBlur = 0;

          // chance de inverter caractere dinamicamente
          const flip = Math.random() < 0.15;

          if (flip) {
            ctx.save();

            ctx.translate(x * hSpacing, y * fontSize);

            // espelha horizontal ou vertical
            if (Math.random() < 0.5) {
              ctx.scale(-1, 1);
            } else {
              ctx.scale(1, -1);
            }

            ctx.fillText(char, 0, 0);
            ctx.restore();
          } else {
            // inversão leve fixa para alguns caracteres (efeito de glitch estático)
            if (flipGrid[y][x]) {
              ctx.save();
              ctx.translate(x * hSpacing, y * fontSize);

              if ((x + y) % 2 === 0) {
                ctx.scale(-1, 1);
              } else {
                ctx.scale(1, -1);
              }

              ctx.fillText(char, 0, 0);
              ctx.restore();
            } else {
              ctx.fillText(char, x * hSpacing, y * fontSize);
            }
          }

          // trava os caracteres próximos da cabeça (mais brilho)
          if (j < 2) {
            lockGrid[y][x] = 10 + Math.random() * 15;
          }

          // =======================
          // CABEÇA DO FEIXE (BRANCO)
          // =======================
          if (j === 0) {
            const speedFactor = beam.speed;
            const intensity = 0.8 + Math.random() * 0.4;

            // bloom externo
            ctx.shadowColor = `rgba(180,255,180,${intensity})`;
            ctx.shadowBlur = 40 + speedFactor * 15;
            ctx.fillStyle = "rgba(255,255,255,0.6)";
            ctx.fillText(char, x * hSpacing, y * fontSize);

            // camada média
            ctx.shadowColor = "rgba(180,255,180,0.8)";
            ctx.shadowBlur = 20 + speedFactor * 10;
            ctx.fillStyle = "rgba(255,255,255,0.8)";
            ctx.fillText(char, x * hSpacing, y * fontSize);

            // núcleo
            ctx.shadowColor = "rgba(220,255,220,1)";
            ctx.shadowBlur = 10 + speedFactor * 5;
            ctx.fillStyle = "rgba(255,255,255,1)";
            ctx.fillText(char, x * hSpacing, y * fontSize);

            continue;
          }

          // =======================
          // CORPO DO FEIXE
          // =======================
          else if (j === 1) {
            // transição branco / verde
            const green = 180 + Math.random() * 50;

            ctx.fillStyle = `rgba(${green * 0.6}, ${green}, ${
              green * 0.4
            }, ${alpha})`;
            ctx.shadowColor = `rgba(120, 255, 180, ${alpha})`;
            ctx.shadowBlur = 18;
          } else {
            const green = 120 + Math.random() * 80;

            ctx.fillStyle = `rgba(${green * 0.2}, ${green}, ${
              green * 0.1
            }, ${alpha})`;

            ctx.shadowBlur = 0;
          }

          ctx.fillText(char, x * hSpacing, y * fontSize);
        }
      }

      // movimento do feixe (descida)
      beam.head += beam.speed * deltaTime;

      // quando sai da tela, reinicia com novos parâmetros
      if (beam.head - beam.length > rows) {
        beam.head = -Math.random() * rows;
        beam.speed = 0.3 + Math.random() * 0.6; //CONTROLE DE VELOCIDADE

        beam.length =
          Math.random() < 0.15
            ? rows * (0.7 + Math.random() * 0.6)
            : 15 + Math.random() * 25;
      }
    }

    // adiciona/remove feixes dinamicamente (variação natural)
    if (Math.random() < 0.01 && beams[x].length < 4) {
      beams[x].push({
        head: -Math.random() * rows * 1.5,
        speed: 0.3 + Math.random() * 0.6, //CONTROLE DE VELOCIDADE
        length: 15 + Math.random() * 25,
      });
    }

    if (Math.random() < 0.0001 && beams[x].length > 1) {
      beams[x].pop();
    }
  }

  // reset de sombra
  ctx.shadowBlur = 0;
}

// ===============================
// LOOP DE ANIMAÇÃO
// ===============================

let lastTime = 0;

function animate(currentTime) {
  if (!lastTime) lastTime = currentTime;

  const deltaTime = Math.min((currentTime - lastTime) / 16.67, 2);
  lastTime = currentTime;

  draw(deltaTime);

  requestAnimationFrame(animate);
}

animate();

// ===============================
// RESPONSIVIDADE
// ===============================
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
