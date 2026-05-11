const express = require('express');
const cors    = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/denuncias', require('./routes/denuncias'));

app.listen(3000, () => console.log('API rodando em http://localhost:3000'));