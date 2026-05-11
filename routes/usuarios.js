const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const db      = require('../db');

// CADASTRO
router.post('/cadastrar', async (req, res) => {
  const { nome, email, telefone, senha } = req.body;

  // Validações básicas
  if (!nome || !email || !telefone || !senha)
    return res.status(400).json({ erro: 'Preencha todos os campos.' });

  if (senha.length < 6)
    return res.status(400).json({ erro: 'Senha deve ter ao menos 6 caracteres.' });

  if (!/^\d{10,11}$/.test(telefone))
    return res.status(400).json({ erro: 'Telefone inválido.' });

  try {
    // Verifica se e-mail ou telefone já existem
    const [existe] = await db.query(
      'SELECT id FROM usuarios WHERE email = ? OR telefone = ?',
      [email, telefone]
    );
    if (existe.length > 0)
      return res.status(409).json({ erro: 'E-mail ou telefone já cadastrado.' });

    // Criptografa a senha
    const hash = await bcrypt.hash(senha, 10);

    await db.query(
      'INSERT INTO usuarios (nome, email, telefone, senha) VALUES (?, ?, ?, ?)',
      [nome, email, telefone, hash]
    );

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });

  } catch (err) {
    res.status(500).json({ erro: 'Erro no servidor.' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?', [email]
    );
    if (rows.length === 0)
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });

    const usuario = rows[0];
    const senhaOk = await bcrypt.compare(senha, usuario.senha);

    if (!senhaOk)
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });

    // Gera o token JWT
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, nome: usuario.nome });

  } catch (err) {
    res.status(500).json({ erro: 'Erro no servidor.' });
  }
});

module.exports = router;