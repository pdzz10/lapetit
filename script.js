let mesaAtual = null;
let contas = JSON.parse(localStorage.getItem('contas_lapetit')) || {};

// Inicializa as 20 mesas se o banco estiver vazio
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
        btn.innerText = `Mesa ${i}`;
        // Adiciona cor laranja se a mesa tiver itens
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

// NOVA LÓGICA: Agrupa itens repetidos
function adicionarItem(nome, preco) {
    if (mesaAtual !== null) {
        // Busca se o item já existe na comanda desta mesa
        const itemExistente = contas[mesaAtual].find(item => item.nome === nome);

        if (itemExistente) {
            itemExistente.quantidade += 1; // Apenas aumenta o número
        } else {
            contas[mesaAtual].push({ nome, preco, quantidade: 1 }); // Adiciona novo
        }
        
        atualizarResumo();
        salvar();
    }
}

// EXIBIÇÃO: Mostra a quantidade (Ex: 2x Pizza)
function atualizarResumo() {
    const lista = document.getElementById('lista-comanda');
    const totalExibicao = document.getElementById('total-mesa');
    let total = 0;
    lista.innerHTML = '';
    
    if(contas[mesaAtual]) {
        contas[mesaAtual].forEach((item, index) => {
            const subtotal = item.preco * item.quantidade;
            total += subtotal;

            lista.innerHTML += `
                <div class="item-linha" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
                    <span style="flex: 1; text-align: left; font-size: 14px;">
                        <strong>${item.quantidade}x</strong> ${item.nome}
                    </span>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-weight: bold; min-width: 70px; text-align: right;">R$ ${subtotal.toFixed(2)}</span>
                        <button onclick="removerItem(${index})" style="background-color: #ff4444 !important; color: white !important; border: none; border-radius: 8px; width: 38px; height: 38px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; -webkit-appearance: none; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">X</button>
                    </div>
                </div>`;
        });
    }
    totalExibicao.innerText = total.toFixed(2);
}

// REMOÇÃO: Diminui 1 ou remove tudo se for o último
function removerItem(index) {
    const item = contas[mesaAtual][index];
    
    if (item.quantidade > 1) {
        if (confirm(`Remover 1 unidade de ${item.nome}?`)) {
            item.quantidade -= 1;
            salvar();
            atualizarResumo();
        }
    } else {
        if (confirm(`Remover ${item.nome} da comanda?`)) {
            contas[mesaAtual].splice(index, 1);
            salvar();
            atualizarResumo();
        }
    }
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
    document.getElementById('area-pedido').classList.add('hidden');
    mesaAtual = null;
    desenharMesas();
}

desenharMesas();