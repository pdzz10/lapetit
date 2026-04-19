let mesaAtual = null;
let contas = JSON.parse(localStorage.getItem('contas_lapetit')) || {};

if (Object.keys(contas).length === 0) {
    for (let i = 1; i <= 20; i++) { contas[i] = []; }
}

function salvar() { localStorage.setItem('contas_lapetit', JSON.stringify(contas)); }

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

// FUNÇÃO ATUALIZADA: Adiciona o ícone de mesa no título da comanda
function abrirMesa(num) {
    mesaAtual = num;
    const area = document.getElementById('area-pedido');
    area.style.display = 'flex';
    
    // Aqui adicionamos o ícone de mesa antes do número
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

function removerItem(index) {
    const item = contas[mesaAtual][index];
    const resp = prompt(`Quantas unidades de ${item.nome} deseja remover?`, "1");
    if (resp !== null && resp !== "") {
        const qtd = parseInt(resp);
        if (isNaN(qtd) || qtd <= 0) return;
        if (qtd >= item.quantidade) { contas[mesaAtual].splice(index, 1); }
        else { item.quantidade -= qtd; }
        salvar(); atualizarResumo();
    }
}

function finalizarConta() {
    if (confirm(`Fechar conta da Mesa ${mesaAtual}?`)) { contas[mesaAtual] = []; salvar(); voltar(); }
}

function voltar() {
    document.getElementById('area-pedido').style.display = 'none';
    document.body.style.overflow = 'auto';
    desenharMesas();
}

desenharMesas();