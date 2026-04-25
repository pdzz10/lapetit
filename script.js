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
    const nome = prompt("Nome do item (Ex: Dose de Pitu, Cigarro):");
    if (!nome) return;
    const precoInput = prompt(`Valor de "${nome}":`, "0.00");
    const preco = parseFloat(precoInput.replace(',', '.'));
    if (isNaN(preco) || preco < 0) { alert("Valor inválido!"); return; }

    contas[mesaAtual].push({ nome: nome + " (Avulso)", preco: preco, quantidade: 1 });

    const itensCozinha = ['Pizza', 'Batata', 'Brotinho', 'Porção', 'Calabresa', 'Pastel'];
    if (itensCozinha.some(palavra => nome.toLowerCase().includes(palavra.toLowerCase()))) {
        const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        pendentes.push({ mesa: mesaAtual, item: nome, hora: hora });
    }
    atualizarResumo(); salvar(); atualizarAlertas();
}

function removerItem(index) {
    if (mesaAtual !== null) {
        contas[mesaAtual].splice(index, 1);
        atualizarResumo(); salvar(); desenharMesas();
    }
}

// ==========================================
// FUNÇÃO ATUALIZADA: MOSTRA O VALOR AO LADO DO ITEM
// ==========================================
function atualizarResumo() {
    const lista = document.getElementById('lista-comanda');
    let total = 0;
    lista.innerHTML = '';
    
    contas[mesaAtual].forEach((item, index) => {
        const subtotalItem = item.preco * item.quantidade;
        total += subtotalItem;
        
        lista.innerHTML += `
            <div class="item-linha" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
                <div style="flex: 1; font-size: 16px;">
                    <strong>${item.quantidade}x</strong> ${item.nome}
                    <span style="color: #27ae60; font-weight: bold; margin-left: 8px;">
                        R$ ${subtotalItem.toFixed(2)}
                    </span>
                </div>
                <button onclick="removerItem(${index})" style="background:#ff4444; color:white; border:none; border-radius:8px; width:35px; height:35px; font-weight:bold;">X</button>
            </div>`;
    });
    document.getElementById('total-mesa').innerText = total.toFixed(2);
}

function dividirConta() {
    const total = parseFloat(document.getElementById('total-mesa').innerText);
    if (total <= 0) return alert("A comanda está vazia!");
    const pessoas = prompt("Dividir por quantas pessoas?", "2");
    if (pessoas !== null && pessoas > 0) {
        const valorCada = total / pessoas;
        alert(`📊 DIVISÃO DA CONTA\n--------------------------\nTotal: R$ ${total.toFixed(2)}\n${pessoas} pessoas\n\nVALOR POR PESSOA: R$ ${valorCada.toFixed(2)}`);
    }
}

function finalizarConta() {
    const total = parseFloat(document.getElementById('total-mesa').innerText);
    if (total <= 0) return;
    const forma = prompt("1-PIX, 2-Dinheiro, 3-Cartão", "1");
    let tipo = "";

    if (forma === "2") {
        tipo = "Dinheiro";
        const valorPago = prompt(`Total: R$ ${total.toFixed(2)}\nDinheiro recebido:`, total);
        if (valorPago !== null) {
            const pago = parseFloat(valorPago.replace(',', '.'));
            if (pago < total) return alert("Valor insuficiente!");
            const troco = pago - total;
            alert(`✅ FECHADO!\nTroco: R$ ${troco.toFixed(2)}`);
        } else return;
    } else {
        tipo = forma === "1" ? "PIX" : "Cartão";
        if (!confirm(`Fechar no ${tipo}?`)) return;
    }

    historicoVendas.push({ mesa: mesaAtual, total: total, hora: new Date().toLocaleTimeString(), pagamento: tipo });
    contas[mesaAtual] = [];
    salvar(); voltar();
}

function atualizarAlertas() {
    const secao = document.getElementById('secao-pendentes');
    const lista = document.getElementById('lista-pendentes');
    if (pendentes.length === 0) { secao.style.display = 'none'; return; }
    secao.style.display = 'block';
    lista.innerHTML = pendentes.map((p, i) => `
        <div class="card-alerta-comida" onclick="entregue(${i})">
            <strong>Mesa ${p.mesa}</strong>: ${p.item} <br><small>${p.hora} - OK?</small>
        </div>`).join('');
}

function entregue(i) { if(confirm("Entregue?")) { pendentes.splice(i, 1
