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
    
    if(contas[mesaAtual]) {
        contas[mesaAtual].forEach((item) => {
            total += item.preco;
            lista.innerHTML += `
                <div class="item-linha">
                    <span>${item.nome}</span>
                    <span>R$ ${item.preco.toFixed(2)}</span>
                </div>`;
        });
    }
    totalExibicao.innerText = total.toFixed(2);
}

// --- NOVAS FUNÇÕES PARA A TELA DE CONFERÊNCIA ---

function abrirConferencia() {
    let totalMesa = parseFloat(document.getElementById('total-mesa').innerText);
    if (totalMesa <= 0) return alert("Não há itens na comanda!");

    // Esconde a tela de pedido e mostra a tela cheia de conferência
    document.getElementById('area-pedido').style.display = 'none';
    document.getElementById('tela-conferencia').style.display = 'flex';
    document.getElementById('tela-conferencia').classList.remove('hidden');
    
    document.getElementById('conf-titulo-mesa').innerText = `Resumo Mesa ${mesaAtual}`;
    
    const listaConf = document.getElementById('conf-lista-itens');
    listaConf.innerHTML = '';
    
    contas[mesaAtual].forEach(item => {
        listaConf.innerHTML += `
            <div class="item-linha" style="font-size: 1.2rem; padding: 10px 0;">
                <span>${item.nome}</span>
                <span>R$ ${item.preco.toFixed(2)}</span>
            </div>`;
    });
    
    document.getElementById('conf-valor-total').innerText = totalMesa.toFixed(2);
}

function voltarParaPedido() {
    document.getElementById('tela-conferencia').style.display = 'none';
    document.getElementById('tela-conferencia').classList.add('hidden');
    document.getElementById('area-pedido').style.display = 'flex';
}

function confirmarFechamentoFinal() {
    if (confirm(`Deseja realmente finalizar a Mesa ${mesaAtual} e limpar o pedido?`)) {
        contas[mesaAtual] = [];
        salvar();
        document.getElementById('tela-conferencia').style.display = 'none';
        document.getElementById('tela-conferencia').classList.add('hidden');
        voltar(); // Volta para o mapa de mesas
    }
}

// --- ---

function voltar() {
    document.getElementById('area-pedido').style.display = 'none';
    document.getElementById('area-pedido').classList.add('hidden');
    mesaAtual = null;
    desenharMesas();
}

desenharMesas();