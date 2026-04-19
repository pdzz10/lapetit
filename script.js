let mesaAtual = null;
let contas = JSON.parse(localStorage.getItem('contas_lapetit')) || {};
let faturamento = JSON.parse(localStorage.getItem('faturamento_lapetit')) || { totalVendido: 0, totalMesas: 0 };

// Inicializa as 20 mesas se o sistema for aberto pela primeira vez
if (Object.keys(contas).length === 0) {
    for (let i = 1; i <= 20; i++) { contas[i] = []; }
}

function salvar() { 
    localStorage.setItem('contas_lapetit', JSON.stringify(contas)); 
    localStorage.setItem('faturamento_lapetit', JSON.stringify(faturamento));
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
    let totalMesa = parseFloat(document.getElementById('total-mesa').innerText);
    if (totalMesa <= 0) return alert("Adicione itens antes de fechar!");

    if (confirm(`Fechar conta da Mesa ${mesaAtual} no valor de R$ ${totalMesa.toFixed(2)}?`)) {
        // Adiciona ao faturamento do dia
        faturamento.totalVendido += totalMesa;
        faturamento.totalMesas += 1;
        
        contas[mesaAtual] = [];
        salvar();
        voltar();
    }
}

function exibirRelatorio() {
    const relatorio = document.getElementById('area-relatorio');
    relatorio.style.display = 'flex';
    relatorio.classList.remove('hidden');
    document.getElementById('total-mesas-dia').innerText = faturamento.totalMesas;
    document.getElementById('valor-total-dia').innerText = faturamento.totalVendido.toFixed(2);
}

function fecharRelatorio() {
    document.getElementById('area-relatorio').style.display = 'none';
    document.getElementById('area-relatorio').classList.add('hidden');
}

function zerarRelatorio() {
    if (confirm("Isso vai apagar todo o faturamento de hoje. Confirmar?")) {
        faturamento = { totalVendido: 0, totalMesas: 0 };
        salvar();
        exibirRelatorio();
    }
}

function voltar() {
    document.getElementById('area-pedido').style.display = 'none';
    document.getElementById('area-pedido').classList.add('hidden');
    mesaAtual = null;
    desenharMesas();
}

// Inicia o sistema desenhando as mesas
desenharMesas();