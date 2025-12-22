let computerNumber                                                                              // Declara a variável que vai guardar o número secreto gerado pelo computador
let userNumbers = []                                                                            // Array que vai armazenar todos os palpites do usuário
let attempts = 0                                                                                // Contador de tentativas iniciando em 1 pois a primeira tentativa já deve ser contada.
let maxguesses = 10                                                                             // Número máximo de tentativas permitidas
function newGame() {                                                                            // Função chamada quando o usuário clica em "NEW GAME"
    window.location.reload()                                                                    // Recarrega a página inteira para reiniciar o jogo
}
function init() {                                                                               // Função chamada automaticamente quando a página carrega (body onload)
   computerNumber = Math.floor(Math.random() * 100 + 1)                                         // Gera um número aleatório entre 1 e 100 e salva em computerNumber
   //console.log(computerNumber)                                                                  // Mostra o número secreto no console (útil para testar)
   document.getElementById('maxAttemptsText').innerHTML = 'Máximo de tentativas: ' + maxguesses // Escreve na tela o número máximo de tentativas usando a variável
}
function compareNumbers() {                                                                     // Pega o número digitado pelo usuário no input e transforma em Number
    const userNumber = Number(document.getElementById('inputBox').value)
let arrow = ""                                                                                  // Cria a variável que vai guardar a seta ou o emoji correspondente ao resultado do palpite.
if (userNumber > computerNumber) {                                                              // Verifica se o palpite do usuário é MAIOR que o número secreto.
    arrow = ` <span class="arrow">⬇️</span>`                                                   // Se for maior, adiciona uma seta para baixo (indicando que o número correto é menor).
} else if (userNumber < computerNumber) {                                                       // Verifica se o palpite do usuário é MENOR que o número secreto.
    arrow = ` <span class="arrow">⬆️</span>`                                                   // Se for menor, adiciona uma seta para cima (indicando que o número correto é maior).
} else {                                                                                        // Se o palpite não é maior nem menor → significa que é EXATAMENTE igual.
    arrow = ` <span class="arrow">🎯</span>`                                                   // Nesse caso, coloca o emoji de acerto.
}
userNumbers.push(`<span class="guess-item">${userNumber}${arrow}</span>`)                       // Adiciona o palpite + a seta correspondente dentro de um <span> estilizado,
                                                                                                // e guarda no array userNumbers (que representa o histórico de palpites).
document.getElementById('guesses').innerHTML = userNumbers.join("<br>")                         // Atualiza a área dos palpites na tela, juntando cada item com vírgula entre eles.
                                                                                                // O join(", ") transforma o array em uma string formatada para exibição.
if (userNumber === computerNumber) {                                                            // Verifica se o número digitado pelo usuário é exatamente igual ao número secreto
    attempts++;                                                                                 // Incrementa o contador de tentativas, já que essa também conta
    document.getElementById('attempts').innerHTML = attempts;                                   // Atualiza na tela o número total de tentativas realizadas
    const textOutput = document.getElementById('textOutput');                                   // Pega o elemento onde exibimos mensagens para o jogador (ex: "too high", "too low")
    textOutput.classList.remove("msg-lose");                                                    // Remove a classe de derrota caso ela tenha sido aplicada anteriormente
    textOutput.classList.add("msg-win");                                                        // Adiciona a classe de vitória, aplicando o estilo verde no texto
    textOutput.innerHTML = 'Parabéns, você acertou!!!';                                         // Exibe a mensagem de acerto na tela
    document.getElementById('inputBox').setAttribute('readonly', 'readonly');                   // Impede o usuário de continuar digitando após finalizar o jogo
    return;                                                                                     // Encerra a função aqui, evitando que qualquer outro código seja executado depois
}
    attempts++                                                                                  //Se NÃO acertou, incrementa o número de tentativas
    document.getElementById('attempts').innerHTML = attempts
    if (attempts >= maxguesses) {                                                               //Depois de incrementar, verifica se o jogador EXCEDEU o limite. Se o jogador usou todas as tentativas -> perdeu
const textOutput = document.getElementById('textOutput');                                       // Seleciona o elemento onde as mensagens são exibidas (ex: "too high", "too low", "You Lose!")
textOutput.innerHTML = 'Você perdeu! O número do computador era ' + computerNumber;                   // Exibe a mensagem de derrota com o número secreto que o jogador não acertou
textOutput.classList.remove('msg-win');                                                         // Remove a classe de vitória caso ela tenha sido aplicada antes
textOutput.classList.add('msg-lose');                                                           // Adiciona a classe de derrota, que deixa o texto vermelho
document.getElementById('inputBox').setAttribute('readonly', 'readonly');                       // Define o campo como "somente leitura", impede o usuário de continuar digitando após perder o jogo
return;                                                                                         // Encerra a função, impedindo qualquer código adicional de rodar

    }
    if (userNumber > computerNumber) {                                                          //Se ainda tem tentativas, dá uma dica (alto ou baixo)
        document.getElementById('textOutput').innerHTML = 'Seu palpite é muito alto'           //Exibe a mensagem se o número do palpite for maior
    } else {
        document.getElementById('textOutput').innerHTML = 'Seu palpite é muito baixo'          //Exibe a mensagem se o número do palpite for menor
    }
    document.getElementById('inputBox').value = ''                                              // Limpa o campo para digitar o próximo palpite
}
