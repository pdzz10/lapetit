let mesaAtual = null;
let contas = JSON.parse(localStorage.getItem('contas_lapetit')) || {};

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
        contas[mesaAtual].push({ nome, preco });
        atualizarResumo();
        salvar();
    }
}

// FUNÇÃO ATUALIZADA COM BOTÃO DE REMOVER
function atualizarResumo() {
    const lista = document.getElementById('lista-comanda');
    const totalExibicao = document.getElementById('total-mesa');
    let total = 0;
    lista.innerHTML = '';
    
    if(contas[mesaAtual]) {
        contas[mesaAtual].forEach((item, index) => {
            total += item.preco;
            lista.innerHTML += `
                <div class="item-linha" style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0;">
                    <span>${item.nome}</span>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span>R$ ${item.preco.toFixed(2)}</span>
                        <button onclick="removerItem(${index})" style="background: #dc3545; color: white; border: none; border-radius: 5px; padding: 5px 10px; cursor: pointer; font-weight: bold;">X</button>
                    </div>
                </div>`;
        });
    }
    totalExibicao.innerText = total.toFixed(2);
}

// NOVA FUNÇÃO PARA EXCLUIR ITEM ESPECÍFICO
function removerItem(index) {
    if (confirm("Deseja remover este item?")) {
        contas[mesaAtual].splice(index, 1);
        salvar();
        atualizarResumo();
    }
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