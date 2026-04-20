let mesaAtual = null;
let contas = JSON.parse(localStorage.getItem('contas_lapetit')) || {};
let historicoVendas = JSON.parse(localStorage.getItem('vendas_dia_lapetit')) || [];
let pendentes = JSON.parse(localStorage.getItem('pendentes_lapetit')) || []; // NOVA LISTA

if (Object.keys(contas).length === 0) {
    for (let i = 1; i <= 20; i++) { contas[i] = []; }
}

function salvar() { 
    localStorage.setItem('contas_lapetit', JSON.stringify(contas)); 
    localStorage.setItem('vendas_dia_lapetit', JSON.stringify(historicoVendas));
    localStorage.setItem('pendentes_lapetit', JSON.stringify(pendentes)); // SALVA PENDENTES
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
    atualizarAlertas(); // ATUALIZA A TELA INICIAL
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
        
        // LOGICA DE COZINHA: Verifica se é comida
        const itensCozinha = ['Pizza', 'Batata', 'Camarão', 'Calabresa', 'Brotinho', 'Porção'];
        if (itensCozinha.some(palavra => nome.includes(palavra))) {
            const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            pendentes.push({ mesa: mesaAtual, item: nome, hora: hora });
        }

        atualizarResumo(); salvar(); atualizarAlertas();
    }
}

function atualizarAlertas() {
    const secao = document.getElementById('secao-pendentes');
    const lista = document.getElementById('lista-pendentes');
    if (pendentes.length === 0) { secao.style.display = 'none'; return; }
    
    secao.style.display = 'block';
    lista.innerHTML = '';
    pendentes.forEach((p, index) => {
        lista.innerHTML += `
            <div class="card-alerta-comida" onclick="confirmarEntrega(${index})">
                <span><strong>Mesa ${p.mesa}</strong>: ${p.item}</span>
                <small>${p.hora} - Toque para OK ✅</small>
            </div>`;
    });
}

function confirmarEntrega(index) {
    if (confirm("Este item já foi entregue à mesa?")) {
        pendentes.splice(index, 1);
        salvar();
        atualizarAlertas();
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
    let tipo = forma === "1" ? "PIX" : (forma === "2" ? "Dinheiro" : "Cartão");
    if (confirm(`Fechar Mesa ${mesaAtual}?`)) {
        historicoVendas.push({ mesa: mesaAtual, total: total, hora: new Date().toLocaleTimeString(), pagamento: tipo });
        contas[mesaAtual] = [];
        salvar(); voltar();
    }
}

function abrirRelatorio() {
    const area = document.getElementById('area-relatorio');
    const lista = document.getElementById('lista-vendas');
    const displayQtd = document.getElementById('qtd-mesas-atendidas');
    let soma = 0;
    displayQtd.innerText = historicoVendas.length;
    lista.innerHTML = historicoVendas.map(v => {
        soma += v.total;
        return `<p style="font-size:13px; border-bottom:1px solid #eee; padding:5px 0;">${v.hora} - M${v.mesa}: R$ ${v.total.toFixed(2)} (${v.pagamento})</p>`;
    }).join('');
    document.getElementById('total-vendas-dia').innerText = soma.toFixed(2);
    area.style.display = 'flex';
}

function fecharRelatorio() { document.getElementById('area-relatorio').style.display = 'none'; }
function voltar() { document.getElementById('area-pedido').style.display = 'none'; document.body.style.overflow = 'auto'; desenharMesas(); }
function resetarRelatorio() { if(confirm("Zerar tudo?")) { historicoVendas = []; pendentes = []; salvar(); abrirRelatorio(); } }

desenharMesas();