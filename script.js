let mesaAtual = null;
let contas = JSON.parse(localStorage.getItem('contas_lapetit')) || {};

// Inicializa as 20 mesas se o banco estiver vazio
if (Object.keys(contas).length === 0) {
    for (let i = 1; i <= 20; i++) { contas[i] = []; }
}

function salvar() { 
    localStorage.setItem('contas_lapetit', JSON.stringify(contas)); 
}

function desenharMesas() {
    const container = document.getElementById('container-mesas');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 1; i <= 20; i++) {
        const btn = document.createElement('button');
        btn.innerText = `Mesa ${i}`;
        btn.className = 'btn-mesa ' + (contas[i] && contas[i].length > 0 ? 'mesa-ocupada' : '');
        btn.onclick = () => abrirMesa(i);
        container.appendChild(btn);
    }
}

function abrirMesa(num) {
    mesaAtual = num;
    const area = document.getElementById('area-pedido');
    area.style.display = 'flex';
    area.classList.remove('hidden');
    document.getElementById('titulo-mesa').innerText = `Mesa ${num}`;
    atualizarResumo();
}

function adicionarItem(nome, preco) {
    if (mesaAtual !== null) {
        const itemExistente = contas[mesaAtual].find(item => item.nome === nome);
        if (itemExistente) {
            itemExistente.quantidade += 1;
        } else {
            contas[mesaAtual].push({ nome, preco, quantidade: 1 });
        }
        atualizarResumo();
        salvar();
    }
}

function atualizarResumo() {
    const lista = document.getElementById('lista-comanda');
    const totalExibicao = document.getElementById('total-mesa');
    let total = 0;
    lista.innerHTML = '';
    
    if(contas[mesaAtual]) {
        contas[mesaAtual].forEach((item, index) => {
            const subtotal = item.preco * item.quantidade;
            total += subtotal;

            lista.innerHTML += `
                <div class="item-linha" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
                    <span style="flex: 1; text-align: left; font-size: 14px;">
                        <strong>${item.quantidade}x</strong> ${item.nome}
                    </span>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-weight: bold; min-width: 70px; text-align: right;">R$ ${subtotal.toFixed(2)}</span>
                        <button onclick="removerItem(${index})" style="background-color: #ff4444 !important; color: white !important; border: none; border-radius: 8px; width: 38px; height: 38px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; -webkit-appearance: none; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">X</button>
                    </div>
                </div>`;
        });
    }
    totalExibicao.innerText = total.toFixed(2);
}

// FUNÇÃO DE REMOVER COM PERGUNTA DE QUANTIDADE
function removerItem(index) {
    const item = contas[mesaAtual][index];
    
    // Abre a caixinha perguntando quantos tirar
    const resposta = prompt(`A mesa tem ${item.quantidade}x ${item.nome}. \nQuantas unidades deseja remover?`, "1");

    // Se cancelar ou não digitar nada, não faz nada
    if (resposta === null || resposta === "") return;

    const qtdParaRemover = parseInt(resposta);

    // Valida se é um número válido
    if (isNaN(qtdParaRemover) || qtdParaRemover <= 0) {
        alert("Por favor, digite um número válido.");
        return;
    }

    if (qtdParaRemover >= item.quantidade) {
        // Se pedir pra tirar tudo ou mais do que tem, remove o item da lista
        if (confirm(`Remover todas as unidades de ${item.nome}?`)) {
            contas[mesaAtual].splice(index, 1);
        }
    } else {
        // Se for menos, apenas subtrai a quantidade
        item.quantidade -= qtdParaRemover;
    }

    salvar();
    atualizarResumo();
}

function finalizarConta() {
    if (confirm(`Fechar conta da Mesa ${mesaAtual}?`)) {
        contas[mesaAtual] = [];
        salvar();
        voltar();
    }
}

function voltar() {
    document.getElementById('area-pedido').style.display = 'none';
    document.getElementById('area-pedido').classList.add('hidden');
    mesaAtual = null;
    desenharMesas();
}

desenharMesas();