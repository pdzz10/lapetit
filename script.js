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

function atualizarResumo() {
    const lista = document.getElementById('lista-comanda');
    const totalExibicao = document.getElementById('total-mesa');
    let total = 0;
    lista.innerHTML = '';
    
    contas[mesaAtual].forEach((item) => {
        total += item.preco;
        lista.innerHTML += `
            <div class="item-linha">
                <span>${item.nome}</span>
                <span>R$ ${item.preco.toFixed(2)}</span>
            </div>`;
    });
    totalExibicao.innerText = total.toFixed(2);
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