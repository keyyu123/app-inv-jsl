let enderecosValidos = []; // Lista para armazenar os endereços válidos

function validarEtiqueta(etiqueta) {
  // Verifica se a etiqueta contém exatamente 12 números
  const regex = /^\d{12}$/;
  return regex.test(etiqueta);
}

function validarEndereco(endereco) {
  // Verifica se o endereço está na lista de endereços válidos
  return enderecosValidos.includes(endereco);
}

function carregarEnderecos() {
  // Faz uma requisição para obter os endereços válidos
  fetch('/api/etiquetas/enderecos')
    .then(response => response.json())
    .then(data => {
      enderecosValidos = data; // Armazena os endereços válidos
      console.log('Endereços válidos carregados:', enderecosValidos);

      // Atualiza o campo de endereço com as opções de um `datalist`
      const datalist = document.getElementById('datalistEnderecos');
      enderecosValidos.forEach(endereco => {
        const option = document.createElement('option');
        option.value = endereco;
        datalist.appendChild(option);
      });
    })
    .catch(err => console.error('Erro ao carregar endereços:', err));
}

function adicionarEtiqueta() {
  const etiqueta = document.getElementById('inputEtiqueta').value;
  const endereco = document.getElementById('inputEndereco').value;

  if (!validarEtiqueta(etiqueta)) {
    alert('A etiqueta deve conter exatamente 12 números.');
    return;
  }

  if (!validarEndereco(endereco)) {
    alert('O endereço informado não é válido.');
    return;
  }

  // Verifica se a etiqueta já existe
  const etiquetasExistentes = []; // Array para armazenar as etiquetas existentes
  fetch('/api/etiquetas')
    .then(response => response.json())
    .then(data => {
      data.forEach(item => {
        etiquetasExistentes.push(item.etiqueta);
      });

      if (etiquetasExistentes.includes(etiqueta)) {
        alert('A etiqueta já foi adicionada anteriormente.');
        return;
      }

      if (etiqueta && endereco) {
        fetch('/api/etiquetas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ etiqueta, endereco })
        })
          .then(response => response.json())
          .then(() => {
            carregarEtiquetas();
            document.getElementById('inputEtiqueta').value = '';
            document.getElementById('inputEndereco').value = '';
            document.getElementById('inputEtiqueta').focus(); // Foca novamente no campo de etiqueta
          })
          .catch(err => console.error('Erro ao adicionar etiqueta:', err));
      } else {
        alert('Por favor, preencha ambos os campos.');
      }
    })
    .catch(err => console.error('Erro ao carregar etiquetas existentes:', err));
}

function carregarEtiquetas() {
  fetch('/api/etiquetas')
    .then(response => response.json())
    .then(data => mostrarEtiquetas(data))
    .catch(err => console.error('Erro ao carregar etiquetas:', err));
}

function mostrarEtiquetas(dados) {
  const tabela = document.getElementById('tabelaEtiquetas');
  tabela.innerHTML = `
    <tr>
      <th>N° Sequencial</th>
      <th>Etiqueta</th>
      <th>Endereço</th>
      <th>Data e Hora</th>
    </tr>
  `;
  dados.forEach(item => {
    const linha = tabela.insertRow();
    linha.insertCell(0).textContent = item.sequencial;
    linha.insertCell(1).textContent = item.etiqueta;
    linha.insertCell(2).textContent = item.endereco;
    linha.insertCell(3).textContent = new Date(item.dataHora).toLocaleString();
  });
}

window.onload = function () {
  carregarEtiquetas();
  carregarEnderecos(); // Carrega os endereços válidos ao iniciar a página
  document.getElementById('inputEtiqueta').focus(); // Foca no campo de etiqueta ao carregar a página
  document.getElementById('inputEtiqueta').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Previne o comportamento padrão do Enter
      if (validarEtiqueta(this.value)) {
        document.getElementById('inputEndereco').focus(); // Foca no campo de endereço
      } else {
        alert('A etiqueta deve conter exatamente 12 números.');
      }
    }
  });
};
