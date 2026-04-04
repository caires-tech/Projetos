const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");
//ctx.globalCompositeOperation = "lighter";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const fontSize = 18;

const horizontalScale = 0.85;
const hSpacing = fontSize * horizontalScale;

const cols = Math.floor(canvas.width / hSpacing);
const rows = Math.floor(canvas.height / fontSize);

ctx.font = "bold " + fontSize + "px monospace";
ctx.textBaseline = "top";

const letters =
  "アイウエオカキクケコサシスセソタチツテトナニヌネハヒフヘホABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789WZMHKYあいうえおかきくけこさしすせそたちつてとなにぬねはひふへほアイウエカキクケコサシスセソタチツテトナニヌネハヒフヘホあいうえおかきくけこさしすせそ";
const lettersArray = letters.split("");

// grid dos caracteres, grid de travamento e grid de velocidade de troca
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
    flipGrid[y][x] = Math.random() < 0.1; // 10% invertidos

    // velocidade individual de troca de cada célula
    changeSpeedGrid[y][x] = 0.09 + Math.random() * 0.15;
  }
}

// FEIXES (máx 2 por coluna)
const beams = [];

for (let x = 0; x < cols; x++) {
  beams[x] = [];

  const beamCount = Math.floor(Math.random() * 2) + 1;

  for (let b = 0; b < beamCount; b++) {
    beams[x].push({
      head: -Math.random() * rows * 1.5,
      speed: 0.5 + Math.random() * 1.2,
      length:
        Math.random() < 0.15
          ? rows * (0.7 + Math.random() * 0.6) // feixes gigantes
          : 15 + Math.random() * 25, // feixes normais
    });
  }
}

function draw() {
  //
  // fundo preto
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  //

  // fade cinematográfico (SEM borrar)
  //ctx.globalCompositeOperation = "source-over";
  //ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
  //ctx.fillRect(0, 0, canvas.width, canvas.height);

  // volta pro modo luz (Matrix)
  //ctx.globalCompositeOperation = "lighter";

  // atualização leve da grid para evitar congelamento
  for (let i = 0; i < cols * 15; i++) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);

    // velocidade base de troca
    let changeChance = changeSpeedGrid[y][x];

    // caracter iluminado, a troca é mais lenta
    if (lockGrid[y][x] > 0) {
      lockGrid[y][x]--;
      changeChance *= 0.8;
    }

    if (Math.random() < changeChance) {
      grid[y][x] =
        lettersArray[Math.floor(Math.random() * lettersArray.length)];
    }
  }

  // desenha feixes
  for (let x = 0; x < cols; x++) {
    for (let beam of beams[x]) {
      for (let j = 0; j < beam.length; j++) {
        if (j > 25) break;
        const y = Math.floor(beam.head - j);

        if (y >= 0 && y < rows) {
          const char = grid[y][x];

          const t = j / beam.length;
          const alpha = Math.pow(1 - t, 2.5);
          // 👇 RASTRO (vem antes de tudo)
          ctx.fillStyle = `rgba(0, 255, 70, ${alpha * 0.1})`;
          ctx.shadowBlur = 0;
          const flip = Math.random() < 0.15;
          if (flip) {
            ctx.save();

            // move origem pro ponto do caractere
            ctx.translate(x * hSpacing, y * fontSize);

            // escolhe tipo de inversão
            if (Math.random() < 0.5) {
              ctx.scale(-1, 1); // horizontal
            } else {
              ctx.scale(1, -1); // vertical
            }

            ctx.fillText(char, 0, 0);

            ctx.restore();
          } else {
            //alterado para flip leve
            if (flipGrid[y][x]) {
              ctx.save();

              ctx.translate(x * hSpacing, y * fontSize);

              // escolhe tipo de inversão (fixo por frame leve)
              if ((x + y) % 2 === 0) {
                ctx.scale(-1, 1); // horizontal
              } else {
                ctx.scale(1, -1); // vertical
              }

              ctx.fillText(char, 0, 0);

              ctx.restore();
            } else {
              ctx.fillText(char, x * hSpacing, y * fontSize);
            }
          }
          // trava caracteres próximos da cabeça
          if (j < 2) {
            lockGrid[y][x] = 10 + Math.random() * 15;
          }

          if (j === 0) {
            const speedFactor = beam.speed;
            const intensity = 0.8 + Math.random() * 0.4;
            // cabeça branca mais intensa
            // camada externa (bloom grande)
            ctx.shadowColor = `rgba(180,255,180,${intensity})`;
            ctx.shadowBlur = 40 + speedFactor * 15;
            ctx.fillStyle = "rgba(255,255,255,0.6)";
            ctx.fillText(char, x * hSpacing, y * fontSize);

            // camada média
            ctx.shadowColor = "rgba(180,255,180,0.8)";
            ctx.shadowBlur = 20 + speedFactor * 10;
            ctx.fillStyle = "rgba(255,255,255,0.8)";
            ctx.fillText(char, x * hSpacing, y * fontSize);

            // núcleo forte
            ctx.shadowColor = "rgba(220,255,220,1)";
            ctx.shadowBlur = 10 + speedFactor * 5;
            ctx.fillStyle = "rgba(255,255,255,1)";
            ctx.fillText(char, x * hSpacing, y * fontSize);
            continue;
          } else if (j === 1) {
            // transição branco → verde
            const green = 180 + Math.random() * 50;

            ctx.fillStyle = `rgba(${green * 0.6}, ${green}, ${green * 0.4}, ${alpha})`;
            ctx.shadowColor = `rgba(120, 255, 180, ${alpha})`;
            ctx.shadowBlur = 18;
          } else {
            const green = 120 + Math.random() * 80;

            ctx.fillStyle = `rgba(${green * 0.2}, ${green}, ${green * 0.1}, ${alpha})`;

            //if (j < 2) {
            //  ctx.shadowColor = `rgba(0, ${green}, 80, ${alpha})`;
            //  ctx.shadowBlur = 8;
            //} else {
            //  ctx.shadowBlur = 0;
            //}
            ctx.shadowBlur = 0;
          }

          ctx.fillText(char, x * hSpacing, y * fontSize);
        }
      }

      // movimento
      beam.head += beam.speed;

      // reset suave
      if (beam.head - beam.length > rows) {
        beam.head = -Math.random() * rows;
        beam.speed = 1.0 + Math.random() * 1.8;
        beam.length =
          Math.random() < 0.15
            ? rows * (0.7 + Math.random() * 0.6)
            : 15 + Math.random() * 25;
      }
    }

    // dinâmica leve
    if (Math.random() < 0.001 && beams[x].length < 2) {
      beams[x].push({
        head: -Math.random() * rows * 1.5,
        speed: 0.5 + Math.random() * 1.2,
        length: 15 + Math.random() * 25,
      });
    }

    if (Math.random() < 0.0005 && beams[x].length > 1) {
      beams[x].pop();
    }
  }

  ctx.shadowBlur = 0;
}

function animate() {
  draw();
  requestAnimationFrame(animate);
}

animate();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
