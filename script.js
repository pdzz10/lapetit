let mesaAtual = null;
let contas = JSON.parse(localStorage.getItem('contas_lapetit')) || {};
// Histórico de vendas do dia
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
        const btn = document.createElement('button');
        btn.innerHTML = `🍕<br>Mesa ${i}`;
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
        atualizarResumo();
        salvar();
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
                        <button onclick="removerItem(${index})" style="background:#ff4444; color:white; border:none; border-radius:8px; width:35px; height:35px; cursor:pointer;">X</button>
                    </div>
                </div>`;
        });
    }
    document.getElementById('total-mesa').innerText = total.toFixed(2);
}

function dividirConta() {
    const total = parseFloat(document.getElementById('total-mesa').innerText);
    if (total <= 0) return alert("Comanda vazia!");
    setTimeout(() => {
        const pessoas = prompt("Dividir em quantas pessoas?", "2");
        if (pessoas) {
            const n = parseInt(pessoas);
            if (n > 0) alert(`Total: R$ ${total.toFixed(2)}\nCada um paga: R$ ${(total/n).toFixed(2)}`);
        }
    }, 100);
}

function removerItem(index) {
    const item = contas[mesaAtual][index];
    const resp = prompt(`Remover quantas unidades de ${item.nome}?`, "1");
    if (resp) {
        const qtd = parseInt(resp);
        if (qtd >= item.quantidade) { contas[mesaAtual].splice(index, 1); }
        else { item.quantidade -= qtd; }
        salvar(); atualizarResumo();
    }
}

function finalizarConta() {
    const total = parseFloat(document.getElementById('total-mesa').innerText);
    if (total <= 0) return alert("Não é possível fechar uma mesa vazia.");

    if (confirm(`Fechar conta da Mesa ${mesaAtual} no valor de R$ ${total.toFixed(2)}?`)) {
        // Salva no histórico antes de limpar
        const agora = new Date();
        const hora = agora.getHours().toString().padStart(2, '0') + ":" + agora.getMinutes().toString().padStart(2, '0');
        historicoVendas.push({ mesa: mesaAtual, total: total, hora: hora });
        
        contas[mesaAtual] = [];
        salvar();
        voltar();
    }
}

// LÓGICA DO RELATÓRIO
function abrirRelatorio() {
    const area = document.getElementById('area-relatorio');
    const lista = document.getElementById('lista-vendas');
    const totalGeral = document.getElementById('total-vendas-dia');
    let soma = 0;
    
    lista.innerHTML = '';
    historicoVendas.forEach((venda) => {
        soma += venda.total;
        lista.innerHTML += `<p style="border-bottom:1px solid #eee; padding:5px 0;">⏰ ${venda.hora} - <strong>Mesa ${venda.mesa}</strong>: R$ ${venda.total.toFixed(2)}</p>`;
    });
    
    totalGeral.innerText = soma.toFixed(2);
    area.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function fecharRelatorio() {
    document.getElementById('area-relatorio').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function resetarRelatorio() {
    if (confirm("Deseja ZERAR o relatório do dia? Faça isso apenas no fim do expediente.")) {
        historicoVendas = [];
        salvar();
        abrirRelatorio();
    }
}

function voltar() {
    document.getElementById('area-pedido').style.display = 'none';
    document.body.style.overflow = 'auto';
    desenharMesas();
}

desenharMesas();