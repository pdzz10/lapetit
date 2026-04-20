let mesaAtual = null;
let contas = JSON.parse(localStorage.getItem('contas_lapetit')) || {};
let historicoVendas = JSON.parse(localStorage.getItem('vendas_dia_lapetit')) || [];

if (Object.keys(contas).length === 0) {
    for (let i = 1; i <= 20; i++) { contas[i] = []; }
}

function salvar() { 
    localStorage.setItem('contas_lapetit', JSON.stringify(contas)); 
    localStorage.setItem('vendas_dia_lapetit', JSON.stringify(historicoVendas));
}

function desenharMesas() {
    const container = document.getElementById('container-mesas');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 1; i <= 20; i++) {
        const totalItens = (contas[i] || []).reduce((acc, item) => acc + item.quantidade, 0);
        const btn = document.createElement('button');
        btn.innerHTML = `🍕<br>Mesa ${i}${totalItens > 0 ? `<br><small style="font-size:10px;">(${totalItens} itens)</small>` : ''}`;
        btn.className = 'btn-mesa ' + (contas[i] && contas[i].length > 0 ? 'mesa-ocupada' : '');
        btn.onclick = () => abrirMesa(i);
        container.appendChild(btn);
    }
}

function abrirMesa(num) {
    mesaAtual = num;
    document.getElementById('area-pedido').style.display = 'flex';
    document.getElementById('titulo-mesa').innerHTML = `🪑 Mesa ${num}`;
    document.body.style.overflow = 'hidden'; 
    atualizarResumo();
}

function adicionarItem(nome, preco) {
    if (mesaAtual !== null) {
        const itemExistente = contas[mesaAtual].find(i => i.nome === nome);
        if (itemExistente) { itemExistente.quantidade += 1; }
        else { contas[mesaAtual].push({ nome, preco, quantidade: 1 }); }
        atualizarResumo(); salvar();
    }
}

function atualizarResumo() {
    const lista = document.getElementById('lista-comanda');
    let total = 0;
    lista.innerHTML = '';
    contas[mesaAtual].forEach((item, index) => {
        const sub = item.preco * item.quantidade;
        total += sub;
        lista.innerHTML += `<div class="item-linha">
            <span><strong>${item.quantidade}x</strong> ${item.nome}</span>
            <button onclick="removerItem(${index})" style="background:#ff4444; color:white; border:none; border-radius:8px; width:30px; height:30px;">X</button></div>`;
    });
    document.getElementById('total-mesa').innerText = total.toFixed(2);
}

function removerItem(index) {
    const item = contas[mesaAtual][index];
    if (item.quantidade > 1) item.quantidade--;
    else contas[mesaAtual].splice(index, 1);
    salvar(); atualizarResumo();
}

function finalizarConta() {
    const total = parseFloat(document.getElementById('total-mesa').innerText);
    if (total <= 0) return;
    const forma = prompt("1-PIX, 2-Dinheiro, 3-Cartão", "1");
    let tipo = forma === "1" ? "PIX" : forma === "2" ? "Dinheiro" : "Cartão";
    if (confirm(`Fechar Mesa ${mesaAtual}?`)) {
        historicoVendas.push({ mesa: mesaAtual, total: total, hora: new Date().toLocaleTimeString(), pagamento: tipo });
        contas[mesaAtual] = [];
        salvar(); voltar();
    }
}

// FUNÇÕES DO RELATÓRIO
function abrirRelatorio() {
    const area = document.getElementById('area-relatorio');
    const lista = document.getElementById('lista-vendas');
    let soma = 0;
    lista.innerHTML = historicoVendas.map(v => {
        soma += v.total;
        return `<p>${v.hora} - M${v.mesa}: R$ ${v.total.toFixed(2)} (${v.pagamento})</p>`;
    }).join('');
    document.getElementById('total-vendas-dia').innerText = soma.toFixed(2);
    area.style.display = 'flex';
}

function fecharRelatorio() { document.getElementById('area-relatorio').style.display = 'none'; }
function voltar() { document.getElementById('area-pedido').style.display = 'none'; document.body.style.overflow = 'auto'; desenharMesas(); }
function resetarRelatorio() { if(confirm("Limpar vendas do dia?")) { historicoVendas = []; salvar(); abrirRelatorio(); } }

desenharMesas();