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
        btn.innerHTML = `🍕<br>Mesa ${i}`;
        btn.className = 'btn-mesa ' + (contas[i] && contas[i].length > 0 ? 'mesa-ocupada' : '');
        btn.onclick = () => abrirMesa(i);
        container.appendChild(btn);
    }
}

function abrirMesa(num) {
    mesaAtual = num;
    const area = document.getElementById('area-pedido');
    area.style.display = 'flex';
    document.getElementById('titulo-mesa').innerText = `Mesa ${num}`;
    
    // Trava o fundo
    document.body.style.overflow = 'hidden'; 
    
    atualizarResumo();
}

function adicionarItem(nome, preco) {
    if (mesaAtual !== null) {
        const itemExistente = contas[mesaAtual].find(item => item.nome === nome);
        if (itemExistente) {
            itemExistente.quantidade += 1;
        } else {
            contas[mesaAtual].push({ nome, preco, quantidade: 1 });
        }
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
        contas[mesaAtual].forEach((item, index) => {
            const q = item.quantidade || 1;
            const subtotal = item.preco * q;
            total += subtotal;

            lista.innerHTML += `
                <div class="item-linha">
                    <span style="flex: 1; text-align: left; font-size: 14px;">
                        <strong>${q}x</strong> ${item.nome}
                    </span>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-weight: bold; min-width: 70px; text-align: right;">R$ ${subtotal.toFixed(2)}</span>
                        <button onclick="removerItem(${index})" style="background-color: #ff4444; color: white; border: none; border-radius: 8px; width: 40px; height: 40px; font-weight: bold; cursor: pointer;">X</button>
                    </div>
                </div>`;
        });
    }
    totalExibicao.innerText = total.toFixed(2);
}

function removerItem(index) {
    const item = contas[mesaAtual][index];
    const qAtual = item.quantidade || 1;
    
    const resposta = prompt(`Remover do item: ${item.nome}\nQuantidade atual: ${qAtual}\nQuantas unidades deseja tirar?`, "1");

    if (resposta === null || resposta === "") return;
    const qtd = parseInt(resposta);

    if (isNaN(qtd) || qtd <= 0) {
        alert("Número inválido.");
        return;
    }

    if (qtd >= qAtual) {
        if (confirm(`Remover todo o item ${item.nome}?`)) {
            contas[mesaAtual].splice(index, 1);
        }
    } else {
        item.quantidade = qAtual - qtd;
    }

    salvar();
    atualizarResumo();
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
    mesaAtual = null;
    document.body.style.overflow = 'auto'; // Destrava o fundo
    desenharMesas();
}

desenharMesas();