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

// FUNÇÃO COM O BOTÃO "X" OTIMIZADO PARA CELULAR
function atualizarResumo() {
    const lista = document.getElementById('lista-comanda');
    const totalExibicao = document.getElementById('total-mesa');
    let total = 0;
    lista.innerHTML = '';
    
    if(contas[mesaAtual]) {
        contas[mesaAtual].forEach((item, index) => {
            total += item.preco;
            lista.innerHTML += `
                <div class="item-linha" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
                    <span style="flex: 1; text-align: left; font-size: 14px;">${item.nome}</span>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-weight: bold; min-width: 70px; text-align: right;">R$ ${item.preco.toFixed(2)}</span>
                        <button onclick="removerItem(${index})" style="background-color: #ff4444 !important; color: white !important; border: none; border-radius: 8px; width: 38px; height: 38px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; -webkit-appearance: none; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">X</button>
                    </div>
                </div>`;
        });
    }
    totalExibicao.innerText = total.toFixed(2);
}

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