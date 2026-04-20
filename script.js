let mesaAtual = null;
let contas = JSON.parse(localStorage.getItem('contas_lapetit')) || {};
let historicoVendas = JSON.parse(localStorage.getItem('vendas_dia_lapetit')) || [];
let pendentes = JSON.parse(localStorage.getItem('pendentes_lapetit')) || [];

if (Object.keys(contas).length === 0) {
    for (let i = 1; i <= 20; i++) { contas[i] = []; }
}

function salvar() { 
    localStorage.setItem('contas_lapetit', JSON.stringify(contas)); 
    localStorage.setItem('vendas_dia_lapetit', JSON.stringify(historicoVendas));
    localStorage.setItem('pendentes_lapetit', JSON.stringify(pendentes));
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
    atualizarAlertas();
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
        
        // Verifica se é item de cozinha para criar alerta
        const itensCozinha = ['Pizza', 'Batata', 'Camarão', 'Carne', 'Calabresa', 'Brotinho'];
        if (itensCozinha.some(k => nome.includes(k))) {
            const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            pendentes.push({ mesa: mesaAtual, item: nome, hora: hora });
        }

        atualizarResumo();
        salvar();
        atualizarAlertas();
    }
}

function atualizarAlertas() {
    const container = document.getElementById('secao-pendentes');
    const lista = document.getElementById('lista-pendentes');
    if (pendentes.length === 0) {
        container.style.display = 'none';
        return;
    }
    container.style.display = 'block';
    lista.innerHTML = '';
    pendentes.forEach((p, index) => {
        lista.innerHTML += `
            <div class="card-alerta-comida" onclick="confirmarEntrega(${index})">
                <span><strong>Mesa ${p.mesa}</strong>: ${p.item}</span>
                <small>${p.hora} - Toque ao entregar ✅</small>
            </div>`;
    });
}

function confirmarEntrega(index) {
    if (confirm("Item entregue na mesa?")) {
        pendentes.splice(index, 1);
        salvar();
        atualizarAlertas();
    }
}

function atualizarResumo() {
    const lista = document.getElementById('lista-comanda');
    let total = 0;
    lista.innerHTML = '';
    if(contas[mesaAtual]) {
        contas[mesaAtual].forEach((item, index) => {
            const sub = item.preco * item.quantidade;
            total += sub;
            lista.innerHTML += `
                <div class="item-linha">
                    <span><strong>${item.quantidade}x</strong> ${item.nome}</span>
                    <div>
                        <span style="font-weight:bold; margin-right:10px;">R$ ${sub.toFixed(2)}</span>
                        <button onclick="removerItem(${index})" style="background:#ff4444; color:white; border:none; border-radius:8px; width:35px; height:35px;">X</button>
                    </div>
                </div>`;
        });
    }
    document.getElementById('total-mesa').innerText = total.toFixed(2);
}

function removerItem(index) {
    const item = contas[mesaAtual][index];
    const resp = prompt(`Remover quantas de ${item.nome}?`, "1");
    if (resp) {
        const qtd = parseInt(resp);
        if (qtd >= item.quantidade) { contas[mesaAtual].splice(index, 1); }
        else { item.quantidade -= qtd; }
        salvar(); atualizarResumo();
    }
}

function finalizarConta() {
    const total = parseFloat(document.getElementById('total-mesa').innerText);
    if (total <= 0) return;
    const forma = prompt("1-PIX, 2-Dinheiro, 3-Cartão", "1");
    let tipo = "";
    if (forma === "1") tipo = "PIX";
    else if (forma === "2") tipo = "Dinheiro";
    else if (forma === "3") {
        const sub = prompt("1-Débito, 2-Crédito", "1");
        tipo = sub === "1" ? "Débito" : "Crédito";
    } else return;

    if (confirm(`Fechar Mesa ${mesaAtual}?`)) {
        const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        historicoVendas.push({ mesa: mesaAtual, total: total, hora: hora, pagamento: tipo });
        contas[mesaAtual] = [];
        salvar();
        voltar();
    }
}

function abrirRelatorio() {
    const area = document.getElementById('area-relatorio');
    const lista = document.getElementById('lista-vendas');
    const resumo = document.getElementById('resumo-por-tipo');
    let soma = 0;
    let t = { PIX: 0, Dinheiro: 0, Débito: 0, Crédito: 0 };

    lista.innerHTML = '';
    historicoVendas.forEach(v => {
        soma += v.total;
        t[v.pagamento] += v.total;
        lista.innerHTML += `<div class="item-linha"><span>${v.hora} - M${v.mesa} (${v.pagamento})</span> <strong>R$ ${v.total.toFixed(2)}</strong></div>`;
    });

    resumo.innerHTML = `<p>PIX: <b>R$ ${t.PIX.toFixed(2)}</b></p><p>Dinheiro: <b>R$ ${t.Dinheiro.toFixed(2)}</b></p><p>Débito: <b>R$ ${t.Débito.toFixed(2)}</b></p><p>Crédito: <b>R$ ${t.Crédito.toFixed(2)}</b></p>`;
    document.getElementById('total-vendas-dia').innerText = soma.toFixed(2);
    area.style.display = 'block';
}

function voltar() { document.getElementById('area-pedido').style.display = 'none'; document.body.style.overflow = 'auto'; desenharMesas(); }
function fecharRelatorio() { document.getElementById('area-relatorio').style.display = 'none'; }
function resetarRelatorio() { if(confirm("Zerar?")) { historicoVendas = []; salvar(); abrirRelatorio(); } }
function dividirConta() {
    const total = parseFloat(document.getElementById('total-mesa').innerText);
    const p = prompt("Dividir por quantos?", "2");
    if(p) alert(`Cada um paga: R$ ${(total/p).toFixed(2)}`);
}

desenharMesas();