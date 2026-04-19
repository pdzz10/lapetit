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

// FUNÇÃO ATUALIZADA: Bloqueia a rolagem do fundo
function abrirMesa(num) {
    mesaAtual = num;
    const area = document.getElementById('area-pedido');
    area.style.display = 'flex';
    area.classList.remove('hidden');
    document.getElementById('titulo-mesa').innerText = `Mesa ${num}`;
    
    // Trava o scroll da página de trás
    document.body.style.overflow = 'hidden'; 
    
    atualizarResumo();
}

function adicionarItem(nome, preco) {
    if (mesaAtual !== null) {
        const itemExistente = contas[mesaAtual].find(item => item.nome === nome);
        if (itemExistente) {
            itemExistente.quantidade += 1;
        } else {
            contas[mesaAtual].push({ nome, preco, quantity: 1, quantidade: 1 });
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
                <div class="item-linha" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
                    <span style="flex: 1; text-align: left; font-size: 14px;">
                        <strong>${q}x</strong> ${item.nome}
                    </span>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-weight: bold; min-width: 70px; text-align: right;">R$ ${subtotal.toFixed(2)}</span>
                        <button onclick="removerItem(${index})" style="background-color: #ff4444 !important; color: white !important; border: none; border-radius: 8px; width: 40px; height: 40px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; -webkit-appearance: none; z-index: 10;">X</button>
                    </div>
                </div>`;
        });
    }
    totalExibicao.innerText = total.toFixed(2);
}

function removerItem(index) {
    const item = contas[mesaAtual][index];
    const qAtual = item.quantidade || 1;
    
    const resposta = prompt(`Mesa ${mesaAtual}: ${qAtual}x ${item.nome}.\nQuantas unidades deseja remover?`, "1");

    if (resposta === null || resposta === "") return;
    const qtdParaRemover = parseInt(resposta);

    if (isNaN(qtdParaRemover) || qtdParaRemover <= 0) {
        alert("Digite um número válido.");
        return;
    }

    if (qtdParaRemover >= qAtual) {
        if (confirm(`Remover todo o item ${item.nome}?`)) {
            contas[mesaAtual].splice(index, 1);
        }
    } else {
        item.quantidade = qAtual - qtdParaRemover;
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

// FUNÇÃO ATUALIZADA: Libera a rolagem do fundo
function voltar() {
    const area = document.getElementById('area-pedido');
    area.style.display = 'none';
    area.classList.add('hidden');
    mesaAtual = null;
    
    // Destrava o scroll da página
    document.body.style.overflow = 'auto'; 
    
    desenharMesas();
}

desenharMesas();