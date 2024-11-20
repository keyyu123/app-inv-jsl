const express = require('express');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const router = express.Router();
const dataFilePath = path.join(__dirname, '../data/etiquetas.json');
const excelFilePath = path.join(__dirname, '../data/etiquetas.xlsx');

// Função para ler os dados do arquivo JSON
function readData() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return []; // Retorna um array vazio se o arquivo não existir
    }
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erro ao ler os dados:', err);
    return [];
  }
}

// Função para salvar dados na planilha Excel
function saveToExcel(data) {
  try {
    const wb = xlsx.utils.book_new(); // Cria uma nova planilha
    const ws = xlsx.utils.json_to_sheet(data); // Converte os dados para formato de planilha
    xlsx.utils.book_append_sheet(wb, ws, 'Etiquetas'); // Adiciona a aba "Etiquetas"
    xlsx.writeFile(wb, excelFilePath); // Salva o arquivo Excel
  } catch (err) {
    console.error('Erro ao salvar na planilha Excel:', err);
  }
}

// Função para salvar os dados no arquivo JSON
function saveData(data) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    saveToExcel(data); // Chama a função para salvar os dados na planilha Excel
  } catch (err) {
    console.error('Erro ao salvar os dados:', err);
  }
}

// Rota para listar as últimas 5 etiquetas
router.get('/', (req, res) => {
  const data = readData();
  const recent = data.slice(-5); // Pega os últimos 5 itens
  res.json(recent);
});

// Rota para obter endereços válidos
router.get('/enderecos', (req, res) => {
  try {
    const workbook = xlsx.readFile(path.join(__dirname, '../data/enderecos.xlsx'));
    const sheetName = workbook.SheetNames[0]; // Pega o nome da primeira aba
    const worksheet = workbook.Sheets[sheetName];
    const json = xlsx.utils.sheet_to_json(worksheet, { header: 1 }); // Carrega como array

    // Supondo que os endereços estejam na primeira coluna (A)
    const enderecos = json.map(row => row[0]).filter(Boolean).map(endereco => endereco.trim()); // Remove espaços em branco
    res.json(enderecos);
  } catch (err) {
    console.error('Erro ao ler a planilha de endereços:', err);
    res.status(500).json({ error: 'Erro ao ler a planilha de endereços.' });
  }
});

// Rota para adicionar uma nova etiqueta
router.post('/', (req, res) => {
  const { etiqueta, endereco } = req.body;

  if (!etiqueta || !endereco) {
    return res.status(400).json({ error: 'Etiqueta e endereço são obrigatórios.' });
  }

  // Carrega os endereços válidos da planilha
  const workbook = xlsx.readFile(path.join(__dirname, '../data/enderecos.xlsx'));
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const json = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  const enderecosValidos = json.map(row => row[0]).filter(Boolean).map(endereco => endereco.trim());

  if (!enderecosValidos.includes(endereco)) {
    return res.status(400).json({ error: 'Endereço inválido.' });
  }

  const data = readData();
  const newItem = {
    sequencial: data.length + 1,
    etiqueta,
    endereco,
    dataHora: new Date().toISOString()
  };

  data.push(newItem);
  saveData(data);

  res.status(201).json(newItem);
});


// Rota para deletar uma etiqueta
router.delete('/:sequencial', (req, res) => {
  const sequencial = parseInt(req.params.sequencial, 10);
  const data = readData();
  
  // Filtra os dados para remover a etiqueta com o sequencial fornecido
  const newData = data.filter(item => item.sequencial !== sequencial);

  // Verifica se a etiqueta foi encontrada
  if (newData.length === data.length) {
    return res.status(404).json({ error: 'Etiqueta não encontrada.' });
  }

  saveData(newData); // Salva os dados atualizados

  res.status(204).send(); // Retorna 204 No Content
});

module.exports = router;