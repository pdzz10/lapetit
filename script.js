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
        
        const itensCozinha = ['Pizza', 'Batata', 'Brotinho', 'Porção', 'Calabresa'];
        if (itensCozinha.some(palavra => nome.includes(palavra))) {
            const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            pendentes.push({ mesa: mesaAtual, item: nome, hora: hora });
        }
        atualizarResumo(); salvar(); atualizarAlertas();
    }
}

function adicionarItemAvulso() {
    if (mesaAtual === null) return;
    const nome = prompt("Nome do item:");
    if (!nome) return;
    const precoInput = prompt(`Valor de "${nome}":`, "0.00");
    const preco = parseFloat(precoInput.replace(',', '.'));
    if (isNaN(preco) || preco < 0) { alert("Valor inválido!"); return; }
    contas[mesaAtual].push({ nome: nome + " (Avulso)", preco: preco, quantidade: 1 });
    atualizarResumo(); salvar(); atualizarAlertas();
}

function removerItem(index) {
    if (mesaAtual !== null) {
        contas[mesaAtual].splice(index, 1);
        atualizarResumo(); salvar(); desenharMesas();
    }
}

// FUNÇÃO COM A ALTERAÇÃO DO VALOR AO LADO
function atualizarResumo() {
    const lista = document.getElementById('lista-comanda');
    let total = 0;
    lista.innerHTML = '';
    
    contas[mesaAtual].forEach((item, index) => {
        const sub = item.preco * item.quantidade;
        total += sub;
        
        // Criando a linha com o nome e o valor somado
        lista.innerHTML += `
            <div class="item-linha" style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid #eee;">
                <span style="flex: 1; text-align: left;">
                    <strong>${item.quantidade}x</strong> ${item.nome} 
                    <span style="color: #27ae60; font-weight: bold; margin-left: 5px;">R$ ${sub.toFixed(2)}</span>
                </span>
                <button onclick="removerItem(${index})" style="background:#ff4444; color:white; border:none; border-radius:8px; width:30px; height:30px; font-weight:bold; margin-left: 10px;">X</button>
            </div>`;
    });
    document.getElementById('total-mesa').innerText = total.toFixed(2);
}

function finalizarConta() {
    const total = parseFloat(document.getElementById('total-mesa').innerText);
    if (total <= 0) return;
    const forma = prompt("1-PIX, 2-Dinheiro, 3-Cartão", "1");
    let tipo = "";

    if (forma === "2") {
        tipo = "Dinheiro";
        const valorPago = prompt(`Total: R$ ${total.toFixed(2)}\nRecebido:`, total);
        if (valorPago !== null) {
            const pago = parseFloat(valorPago.replace(',', '.'));
            if (pago < total) return alert("Valor insuficiente!");
            alert(`✅ FECHADO! Troco: R$ ${(pago - total).toFixed(2)}`);
        } else return;
    } else {
        tipo = forma === "1" ? "PIX" : "Cartão";
        if (!confirm(`Fechar no ${tipo}?`)) return;
    }

    historicoVendas.push({ mesa: mesaAtual, total: total, hora: new Date().toLocaleTimeString(), pagamento: tipo });
    contas[mesaAtual] = [];
    salvar(); voltar();
}

function voltar() { document.getElementById('area-pedido').style.display = 'none'; document.body.style.overflow = 'auto'; desenharMesas(); }
function abrirRelatorio() { document.getElementById('area-relatorio').style.display = 'flex'; atualizarRelatorio(); }
function atualizarRelatorio() {
    let soma = 0;
    document.getElementById('qtd-mesas-atendidas').innerText = historicoVendas.length;
    document.getElementById('lista-vendas').innerHTML = historicoVendas.map(v => {
        soma += v.total;
        return `<p>${v.hora} - M${v.mesa}: R$ ${v.total.toFixed(2)} (${v.pagamento})</p>`;
    }).join('');
    document.getElementById('total-vendas-dia').innerText = soma.toFixed(2);
}
function fecharRelatorio() { document.getElementById('area-relatorio').style.display = 'none'; }
function resetarRelatorio() { if(confirm("Zerar noite?")) { historicoVendas = []; pendentes = []; salvar(); fecharRelatorio(); desenharMesas(); } }
function dividirConta() {
    const total = parseFloat(document.getElementById('total-mesa').innerText);
    if (total <= 0) return alert("Vazia!");
    const p = prompt("Dividir por quantos?", "2");
    if (p > 0) alert(`Cada um: R$ ${(total/p).toFixed(2)}`);
}
function atualizarAlertas() {
    const secao = document.getElementById('secao-pendentes');
    const lista = document.getElementById('lista-pendentes');
    if (pendentes.length === 0) { secao.style.display = 'none'; return; }
    secao.style.display = 'block';
    lista.innerHTML = pendentes.map((p, i) => `<div class="card-alerta-comida" onclick="entregue(${i})"><strong>Mesa ${p.mesa}</strong>: ${p.item}</div>`).join('');
}
function entregue(i) { if(confirm("Entregue?")) { pendentes.splice(i, 1); salvar(); atualizarAlertas(); } }

desenharMesas();
