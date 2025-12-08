function outcome() { // Declara a função chamada quando o botão "calculate" é clicado

    let num1 = Number(document.getElementById('num-one').value)
    // Busca o valor digitado no input com id "num-one",
    // converte esse valor para Number e guarda na variável num1.

    let num2 = Number(document.getElementById('num-two').value)
    // Busca o valor digitado no input com id "num-two",
    // converte para Number e guarda na variável num2.

    let total = 0
    // Cria a variável total e inicia com 0 (será usada depois para armazenar o resultado).

    // Verifica qual botão de operação (radio button) está marcado:

    if (document.getElementById('box1').checked)
        total = num1 + num2            // Se o botão da soma estiver marcado, soma os valores
    else if (document.getElementById('box2').checked)
        total = num1 - num2            // Se for o da subtração, subtrai
    else if (document.getElementById('box3').checked)
        total = num1 * num2            // Se for o da multiplicação, multiplica
    else
        total = num1 / num2            // Caso contrário, divide (box4)

    // Exibe o resultado na tela:
    document.getElementById('resultArea').innerHTML = 'Resultado: ' + String(total)
    // Busca o elemento <h1 id="resultArea"> e substitui seu conteúdo
    // pelo texto 'Result: ' + o valor calculado convertido para string.
}
