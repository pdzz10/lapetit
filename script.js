let mesaAtual = null;
let contas = JSON.parse(localStorage.getItem('contas_lapetit')) || {};

if (Object.keys(contas).length === 0) {
    for (let i = 1; i <= 20; i++) { contas[i] = []; }
}

const containerMesas = document.getElementById('container-mesas');
const areaPedido = document.getElementById('area-pedido');

function salvar() { 
    localStorage.setItem('contas_lapetit', JSON.stringify(contas)); 
}

function desenharMesas() {
    if (!containerMesas) return;
    containerMesas.innerHTML = '';
    for (let i = 1; i <= 20; i++) {
        const btn = document.createElement('button');
        btn.innerText = `Mesa ${i}`;
        btn.className = 'btn-mesa ' + (contas[i] && contas[i].length > 0 ? 'mesa-ocupada' : '');
        btn.onclick = () => abrirMesa(i);
        containerMesas.appendChild(btn);
    }
}

function abrirMesa(numero) {
    mesaAtual = numero;
    if (areaPedido) {
        areaPedido.style.display = 'flex';
        areaPedido.classList.remove('hidden');
    }
    document.getElementById('titulo-mesa').innerText = `Mesa ${numero}`;
    atualizarResumo();
}

function adicionarItem(nome, preco) {
    if (mesaAtual !== null) {
        contas[mesaAtual].push({ nome, preco });
        atualizarResumo();
        salvar();
    }
}

function removerItem(index) {
    contas[mesaAtual].splice(index, 1);
    atualizarResumo();
    salvar();
}

function atualizarResumo() {
    const lista = document.getElementById('lista-comanda');
    const totalExibicao = document.getElementById('total-mesa');
    if (!lista) return;

    lista.innerHTML = '';
    let total = 0;
    contas[mesaAtual].forEach((item, index) => {
        total += item.preco;
        lista.innerHTML += `
            <div class="item-linha">
                <span>${item.nome}</span>
                <span>R$ ${item.preco.toFixed(2)}</span>
                <button class="btn-remover" onclick="removerItem(${index})">x</button>
            </div>`;
    });
    totalExibicao.innerText = total.toFixed(2);
}

function finalizarConta() {
    if (contas[mesaAtual].length === 0) return alert("Mesa vazia!");
    if (confirm("Fechar conta da Mesa " + mesaAtual + "?")) {
        contas[mesaAtual] = [];
        salvar();
        voltar();
    }
}

function voltar() {
    if (areaPedido) {
        areaPedido.style.display = 'none';
        areaPedido.classList.add('hidden');
    }
    mesaAtual = null;
    desenharMesas();
}

desenharMesas();