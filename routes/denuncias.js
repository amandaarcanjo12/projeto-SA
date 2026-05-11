const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');

const ARQUIVO = path.join(__dirname, '../denuncias.json');

// Funções auxiliares de leitura e escrita
function lerDenuncias() {
    const conteudo = fs.readFileSync(ARQUIVO, 'utf-8');
    return JSON.parse(conteudo);
}

function salvarDenuncias(lista) {
    fs.writeFileSync(ARQUIVO, JSON.stringify(lista, null, 2));
}


// ================================
// CRIAR denúncia  →  POST /denuncias
// ================================
router.post('/', (req, res) => {
    const { titulo, descricao, local, categoria } = req.body;

    if (!titulo || !descricao || !local || !categoria) {
        return res.status(400).json({ erro: 'Preencha todos os campos.' });
    }

    const lista = lerDenuncias();

    const nova = {
        id:        lista.length + 1,
        titulo,
        descricao,
        local,
        categoria,
        status:    'Pendente',
        data:      new Date().toLocaleDateString('pt-BR')
    };

    lista.push(nova);
    salvarDenuncias(lista);

    res.status(201).json({ mensagem: 'Denúncia criada!', denuncia: nova });
});


// ================================
// LISTAR / FILTRAR  →  GET /denuncias
// ================================
router.get('/', (req, res) => {
    const { categoria, status } = req.query;

    let lista = lerDenuncias();

    if (categoria) {
        lista = lista.filter(d => d.categoria === categoria);
    }

    if (status) {
        lista = lista.filter(d => d.status === status);
    }

    // Mais recente primeiro
    lista = lista.reverse();

    res.json(lista);
});


// ================================
// BUSCAR UMA  →  GET /denuncias/:id
// ================================
router.get('/:id', (req, res) => {
    const lista = lerDenuncias();
    const item  = lista.find(d => d.id === Number(req.params.id));

    if (!item) {
        return res.status(404).json({ erro: 'Denúncia não encontrada.' });
    }

    res.json(item);
});


// ================================
// DELETAR  →  DELETE /denuncias/:id
// ================================
router.delete('/:id', (req, res) => {
    let lista = lerDenuncias();
    const index = lista.findIndex(d => d.id === Number(req.params.id));

    if (index === -1) {
        return res.status(404).json({ erro: 'Denúncia não encontrada.' });
    }

    lista.splice(index, 1);
    salvarDenuncias(lista);

    res.json({ mensagem: 'Denúncia removida.' });
});


module.exports = router;