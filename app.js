const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const etiquetasRoutes = require('./routes/etiquetas');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rotas
app.use('/api/etiquetas', etiquetasRoutes);

// Inicializa o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em: http://192.168.0.197:${PORT}`);
});

