// js/scripts.js — usado pelas 5 páginas.
// Cada bloco só roda se os elementos dele existirem na página atual.

// =====================================================
// 1) FORMULÁRIO: validação + feedback + localStorage
//    (formulario.html)
// =====================================================
const CHAVE_CONTATOS = 'contatos';

function lerContatos() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_CONTATOS)) || [];
  } catch (erro) {
    return []; // JSON quebrado ou localStorage bloqueado
  }
}

function salvarContatos(lista) {
  try {
    localStorage.setItem(CHAVE_CONTATOS, JSON.stringify(lista));
    return true;
  } catch (erro) {
    return false;
  }
}

const form = document.getElementById('form-contato');

if (form) {
  const msgErro = document.getElementById('erro');
  const msgSaida = document.getElementById('saida');
  const listaEl = document.getElementById('lista-contatos');
  const btnLimpar = document.getElementById('btn-limpar');

  function mostrarErro(texto, campo) {
    msgSaida.textContent = '';
    msgSaida.classList.remove('ok');
    msgErro.textContent = texto;
    msgErro.classList.add('erro');
    if (campo) {
      campo.setAttribute('aria-invalid', 'true');
      campo.focus();
    }
  }

  function mostrarSucesso(texto) {
    msgErro.textContent = '';
    msgErro.classList.remove('erro');
    msgSaida.textContent = texto;
    msgSaida.classList.add('ok');
  }

  function limparMarcacoes() {
    form.querySelectorAll('[aria-invalid]').forEach(function (el) {
      el.removeAttribute('aria-invalid');
    });
  }

  function desenharLista() {
    const contatos = lerContatos();
    listaEl.textContent = '';

    if (contatos.length === 0) {
      const vazio = document.createElement('li');
      vazio.className = 'vazio';
      vazio.textContent = 'Nenhuma mensagem enviada ainda.';
      listaEl.appendChild(vazio);
      btnLimpar.hidden = true;
      return;
    }

    // mais recente primeiro
    contatos.slice().reverse().forEach(function (c) {
      const li = document.createElement('li');
      const titulo = document.createElement('strong');
      titulo.textContent = c.nome + ' — ' + c.assunto;
      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = c.email + ' · ' + c.data;
      const texto = document.createElement('div');
      texto.textContent = c.mensagem;
      li.append(titulo, meta, texto);
      listaEl.appendChild(li);
    });
    btnLimpar.hidden = false;
  }

  function dataDeHoje() {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mes + '-' + dia;
  }

  function urlValida(texto) {
    try {
      const u = new URL(texto);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch (erro) {
      return false;
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault(); // não recarrega a página
    limparMarcacoes();

    const el = form.elements;
    const nome = el['nome'].value.trim();
    const email = el['email'].value.trim();
    const telefone = el['telefone'].value.trim();
    const site = el['site'].value.trim();
    const data = el['data'].value;
    const assunto = el['assunto'].value;
    const mensagem = el['mensagem'].value.trim();
    const preferencia = el['preferencia'].value;

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const telefoneValido = /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/.test(telefone);

    // === onde o if decide: o primeiro problema encontrado vira erro ===
    if (nome.length < 3) {
      mostrarErro('Informe seu nome completo (mínimo 3 letras).', el['nome']);
    } else if (!emailValido) {
      mostrarErro('Informe um e-mail válido, como nome@exemplo.com.', el['email']);
    } else if (telefone !== '' && !telefoneValido) {
      mostrarErro('Telefone inválido. Use o formato (11) 99999-9999.', el['telefone']);
    } else if (site !== '' && !urlValida(site)) {
      mostrarErro('O endereço do site deve começar com http:// ou https://.', el['site']);
    } else if (data !== '' && data < dataDeHoje()) {
      mostrarErro('A data de retorno não pode ser anterior a hoje.', el['data']);
    } else if (assunto === '') {
      mostrarErro('Escolha um assunto.', el['assunto']);
    } else if (mensagem.length < 10) {
      mostrarErro('A mensagem precisa ter pelo menos 10 caracteres.', el['mensagem']);
    } else if (mensagem.length > 500) {
      mostrarErro('A mensagem pode ter no máximo 500 caracteres.', el['mensagem']);
    } else if (!el['aceite'].checked) {
      mostrarErro('Marque a caixa de concordância para enviar.', el['aceite']);
    } else {
      const contatos = lerContatos();
      contatos.push({
        nome: nome,
        email: email,
        telefone: telefone,
        site: site,
        dataRetorno: data,
        assunto: assunto,
        mensagem: mensagem,
        preferencia: preferencia,
        data: new Date().toLocaleString('pt-BR')
      });

      if (salvarContatos(contatos)) {
        mostrarSucesso('Obrigado, ' + nome + '! Sua mensagem foi enviada e salva neste navegador.');
        form.reset();
        desenharLista();
      } else {
        mostrarErro('Não consegui salvar no navegador. Verifique se o armazenamento está bloqueado.');
      }
    }
  });

  form.addEventListener('reset', function () {
    limparMarcacoes();
    msgErro.textContent = '';
    msgErro.classList.remove('erro');
    msgSaida.textContent = '';
    msgSaida.classList.remove('ok');
  });

  btnLimpar.addEventListener('click', function () {
    localStorage.removeItem(CHAVE_CONTATOS);
    desenharLista();
    mostrarSucesso('Histórico apagado.');
  });

  desenharLista(); // ao abrir a página, mostra o que já estava salvo
}

// =====================================================
// 2) GRÁFICO CANVAS (graficos.html)
// =====================================================
const canvas = document.getElementById('grafico-canvas');

if (canvas && canvas.getContext) {
  const ctx = canvas.getContext('2d');
  const dados = [
    { rotulo: 'HTML5', valor: 3, cor: '#2f9e83' },
    { rotulo: 'CSS3', valor: 2, cor: '#16324f' },
    { rotulo: 'JavaScript', valor: 2, cor: '#d97757' }
  ];
  const MAXIMO = 5;
  const esquerda = 110;
  const direita = 40;
  const alturaBarra = 40;
  const espaco = 35;
  const larguraTotal = canvas.width - esquerda - direita;

  function desenhar(progresso) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '16px Arial, sans-serif';
    ctx.textBaseline = 'middle';

    // linhas de grade de 0 a 5
    for (let i = 0; i <= MAXIMO; i++) {
      const x = esquerda + (larguraTotal * i) / MAXIMO;
      ctx.strokeStyle = '#dde3e8';
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, canvas.height - 40);
      ctx.stroke();
      ctx.fillStyle = '#5b6b7a';
      ctx.textAlign = 'center';
      ctx.fillText(i, x, canvas.height - 20);
    }

    dados.forEach(function (d, i) {
      const y = 40 + i * (alturaBarra + espaco);
      const largura = (larguraTotal * d.valor * progresso) / MAXIMO;

      ctx.fillStyle = '#24313f';
      ctx.textAlign = 'right';
      ctx.fillText(d.rotulo, esquerda - 12, y + alturaBarra / 2);

      ctx.fillStyle = d.cor;
      ctx.fillRect(esquerda, y, largura, alturaBarra);
    });
  }

  function animar() {
    const inicio = performance.now();
    const duracao = 900;
    function quadro(agora) {
      const t = Math.min((agora - inicio) / duracao, 1);
      desenhar(1 - Math.pow(1 - t, 3)); // começa rápido e desacelera
      if (t < 1) requestAnimationFrame(quadro);
    }
    requestAnimationFrame(quadro);
  }

  const btnAnimar = document.getElementById('btn-animar');
  if (btnAnimar) btnAnimar.addEventListener('click', animar);
  animar();
}
