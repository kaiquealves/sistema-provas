// Variáveis globais
let prova = null;
let questaoAtual = 0;
let respostas = [];
let temporizador = null;
let tempoRestante = 0;

// Estado do catálogo
let catalogo = null;
let moduloAtualCatalogo = null;
let nivelAtualCatalogo = null;

// Função para carregar o arquivo JSON da prova a partir de um objeto JSON
function carregarProvaDeObjeto(jsonObj) {
    try {
        prova = jsonObj;
        
        // Inicializar array de respostas
        respostas = new Array(prova.questoes.length).fill(null);
        
        // Exibir informações do cabeçalho da prova
        document.getElementById('disciplina').textContent = prova.cabecalho.disciplina;
        document.getElementById('serie').textContent = prova.cabecalho.serie;
        document.getElementById('tema').textContent = prova.cabecalho.tema;
        document.getElementById('pontos-totais').textContent = prova.cabecalho.pontuacaoTotal;
        
        // Atualizar contador de questões
        document.getElementById('contador-questoes').textContent = `Questão 1 de ${prova.questoes.length}`;
        
        // Mostrar o container da prova e esconder o container de entrada
        document.getElementById('entrada-container').classList.add('hidden');
        document.getElementById('prova-container').classList.remove('hidden');
        
        console.log('Prova carregada com sucesso:', prova);
        return true;
    } catch (error) {
        console.error('Erro ao processar a prova:', error);
        mostrarErro('Erro ao processar o JSON da prova. Verifique o formato e tente novamente.');
        return false;
    }
}

// Função para mostrar mensagem de erro
function mostrarErro(mensagem) {
    const erroElement = document.getElementById('erro-json');
    erroElement.textContent = mensagem;
    erroElement.classList.remove('hidden');
    
    // Esconder a mensagem após alguns segundos
    setTimeout(() => {
        erroElement.classList.add('hidden');
    }, 5000);
}

// Função para carregar o arquivo JSON da prova a partir de um arquivo
async function carregarProvaDeArquivo(arquivo) {
    try {
        const texto = await arquivo.text();
        const jsonObj = JSON.parse(texto);
        return carregarProvaDeObjeto(jsonObj);
    } catch (error) {
        console.error('Erro ao ler o arquivo JSON:', error);
        mostrarErro('Erro ao ler o arquivo JSON. Verifique se o formato está correto.');
        return false;
    }
}

// Função para carregar o arquivo JSON da prova a partir de texto
function carregarProvaDeTexto(texto) {
    try {
        const jsonObj = JSON.parse(texto);
        return carregarProvaDeObjeto(jsonObj);
    } catch (error) {
        console.error('Erro ao processar o texto JSON:', error);
        mostrarErro('Erro ao processar o texto JSON. Verifique se o formato está correto.');
        return false;
    }
}

// ===== Catálogo de provas =====

// Carrega o índice do catálogo e renderiza a tela inicial de módulos
async function carregarCatalogo() {
    try {
        const response = await fetch('catalogo.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        catalogo = await response.json();
        renderizarModulos();
    } catch (error) {
        console.error('Erro ao carregar o catálogo:', error);
        const container = document.getElementById('catalogo-container');
        container.innerHTML = '<p class="catalogo-vazio">Não foi possível carregar o catálogo. Certifique-se de servir a página via HTTP (ex.: <code>python3 -m http.server</code>).</p>';
    }
}

function renderizarModulos() {
    moduloAtualCatalogo = null;
    nivelAtualCatalogo = null;

    renderizarBreadcrumb([{ label: 'Catálogo', handler: null }]);

    const container = document.getElementById('catalogo-container');
    container.innerHTML = '';

    const titulo = document.createElement('h3');
    titulo.textContent = 'Módulos disponíveis';
    container.appendChild(titulo);

    const grid = document.createElement('div');
    grid.className = 'catalogo-grid';

    catalogo.modulos.forEach(modulo => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'catalogo-card';
        card.innerHTML = `
            <h4>${modulo.nome}</h4>
            ${modulo.descricao ? `<p>${modulo.descricao}</p>` : ''}
        `;
        card.addEventListener('click', () => renderizarNiveis(modulo.id));
        grid.appendChild(card);
    });

    container.appendChild(grid);
}

function renderizarNiveis(moduloId) {
    moduloAtualCatalogo = catalogo.modulos.find(m => m.id === moduloId);
    nivelAtualCatalogo = null;

    renderizarBreadcrumb([
        { label: 'Catálogo', handler: renderizarModulos },
        { label: moduloAtualCatalogo.nome, handler: null }
    ]);

    const container = document.getElementById('catalogo-container');
    container.innerHTML = '';

    const titulo = document.createElement('h3');
    titulo.textContent = `${moduloAtualCatalogo.rotuloNivel || 'Nível'}: escolha uma opção`;
    container.appendChild(titulo);

    const grid = document.createElement('div');
    grid.className = 'catalogo-grid';

    moduloAtualCatalogo.niveis.forEach(nivel => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'catalogo-card';
        card.innerHTML = `<h4>${nivel.nome}</h4>`;
        card.addEventListener('click', () => renderizarProvasDoNivel(nivel.id));
        grid.appendChild(card);
    });

    container.appendChild(grid);
}

function renderizarProvasDoNivel(nivelId) {
    nivelAtualCatalogo = moduloAtualCatalogo.niveis.find(n => n.id === nivelId);

    renderizarBreadcrumb([
        { label: 'Catálogo', handler: renderizarModulos },
        { label: moduloAtualCatalogo.nome, handler: () => renderizarNiveis(moduloAtualCatalogo.id) },
        { label: nivelAtualCatalogo.nome, handler: null }
    ]);

    const container = document.getElementById('catalogo-container');
    container.innerHTML = '';

    const rotuloMateria = moduloAtualCatalogo.rotuloMateria || 'Matéria';

    nivelAtualCatalogo.materias.forEach(materia => {
        const section = document.createElement('section');
        section.className = 'catalogo-materia';

        const cabecalho = document.createElement('h3');
        cabecalho.innerHTML = `<span class="catalogo-materia-rotulo">${rotuloMateria}:</span> ${materia.nome}`;
        section.appendChild(cabecalho);

        const lista = document.createElement('ul');
        lista.className = 'catalogo-provas-lista';

        materia.provas.forEach(provaMeta => {
            const item = document.createElement('li');

            const info = document.createElement('span');
            info.className = 'catalogo-prova-titulo';
            info.textContent = provaMeta.titulo;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-primary';
            btn.textContent = 'Iniciar';
            btn.addEventListener('click', () => carregarProvaDoCatalogo(provaMeta.arquivo));

            item.appendChild(info);
            item.appendChild(btn);
            lista.appendChild(item);
        });

        section.appendChild(lista);
        container.appendChild(section);
    });
}

function renderizarBreadcrumb(crumbs) {
    const bc = document.getElementById('catalogo-breadcrumb');
    bc.innerHTML = '';

    crumbs.forEach((crumb, i) => {
        if (i > 0) {
            const sep = document.createElement('span');
            sep.className = 'breadcrumb-sep';
            sep.textContent = ' › ';
            bc.appendChild(sep);
        }

        if (crumb.handler) {
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = crumb.label;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                crumb.handler();
            });
            bc.appendChild(link);
        } else {
            const span = document.createElement('span');
            span.className = 'breadcrumb-current';
            span.textContent = crumb.label;
            bc.appendChild(span);
        }
    });
}

async function carregarProvaDoCatalogo(arquivoPath) {
    try {
        const response = await fetch(arquivoPath);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const jsonObj = await response.json();
        return carregarProvaDeObjeto(jsonObj);
    } catch (error) {
        console.error('Erro ao carregar a prova do catálogo:', error);
        mostrarErro('Não foi possível carregar a prova selecionada. Tente novamente.');
        return false;
    }
}

// Função para iniciar a prova
function iniciarProva() {
    // Esconder instruções e mostrar container de questões
    document.getElementById('instrucoes').classList.add('hidden');
    document.getElementById('questoes-container').classList.remove('hidden');
    document.getElementById('navegacao-questoes').classList.remove('hidden');
    document.getElementById('acoes-prova').classList.remove('hidden');
    
    // Configurar temporizador se estiver ativo
    if (prova.cabecalho.temporizador && prova.cabecalho.temporizador.ativo) {
        tempoRestante = prova.cabecalho.temporizador.tempoEmMinutos * 60;
        document.getElementById('timer-container').classList.remove('hidden');
        atualizarTemporizador();
        temporizador = setInterval(atualizarTemporizador, 1000);
    }
    
    // Carregar a primeira questão
    carregarQuestao(0);
}

// Função para carregar uma questão específica
function carregarQuestao(indice) {
    // Atualizar questão atual
    questaoAtual = indice;
    
    // Atualizar contador de questões
    document.getElementById('contador-questoes').textContent = `Questão ${indice + 1} de ${prova.questoes.length}`;
    
    // Obter a questão atual
    const questao = prova.questoes[indice];
    
    // Limpar o container de questões
    const questoesContainer = document.getElementById('questoes-container');
    questoesContainer.innerHTML = '';
    
    // Criar elemento da questão
    const questaoElement = document.createElement('div');
    questaoElement.className = 'questao';
    questaoElement.id = `questao-${questao.id}`;
    
    // Criar cabeçalho da questão
    const questaoHeader = document.createElement('div');
    questaoHeader.className = 'questao-header';
    questaoHeader.innerHTML = `
        <h3>Questão ${indice + 1}</h3>
        <div class="questao-pontuacao">Pontuação: ${questao.pontuacao} pontos</div>
    `;
    questaoElement.appendChild(questaoHeader);
    
    // Criar enunciado da questão
    const enunciadoElement = document.createElement('div');
    enunciadoElement.className = 'questao-enunciado';
    enunciadoElement.textContent = questao.enunciado;
    questaoElement.appendChild(enunciadoElement);
    
    // Se a questão tiver imagem, adicionar
    if (questao.tipo === 'multiplaEscolha' && questao.subTipo === 'comImagem' && questao.imagem) {
        const imagemElement = document.createElement('img');
        imagemElement.src = questao.imagem;
        imagemElement.alt = 'Imagem da questão';
        imagemElement.className = 'questao-imagem';
        questaoElement.appendChild(imagemElement);
    }
    
    // Criar opções da questão com base no tipo
    const opcoesElement = document.createElement('div');
    opcoesElement.className = 'questao-opcoes';
    
    switch (questao.tipo) {
        case 'multiplaEscolha':
            renderizarMultiplaEscolha(opcoesElement, questao);
            break;
            
        case 'verdadeiroFalso':
            renderizarVerdadeiroFalso(opcoesElement, questao);
            break;
            
        case 'associacao':
            renderizarAssociacao(opcoesElement, questao);
            break;
            
        case 'ordenacao':
            renderizarOrdenacao(opcoesElement, questao);
            break;
            
        case 'completarLacunas':
            renderizarCompletarLacunas(opcoesElement, questao);
            break;
    }
    
    questaoElement.appendChild(opcoesElement);
    
    // Adicionar a questão ao container
    questoesContainer.appendChild(questaoElement);
    
    // Atualizar botões de navegação
    document.getElementById('anterior').disabled = indice === 0;
    document.getElementById('proxima').disabled = indice === prova.questoes.length - 1;
    
    // Restaurar resposta salva, se existir
    restaurarRespostaSalva(questao);
}

// Função para renderizar questão de múltipla escolha
function renderizarMultiplaEscolha(container, questao) {
    const isMultipla = questao.subTipo === 'multipla';
    
    questao.opcoes.forEach((opcao, index) => {
        const opcaoElement = document.createElement('div');
        opcaoElement.className = 'opcao-multipla';
        opcaoElement.dataset.indice = index;
        opcaoElement.textContent = opcao;
        
        // Adicionar evento de clique
        opcaoElement.addEventListener('click', () => {
            if (isMultipla) {
                // Para múltipla escolha, toggle a classe selecionada
                opcaoElement.classList.toggle('selecionada');
            } else {
                // Para escolha única, remover seleção de todas as opções e selecionar apenas esta
                document.querySelectorAll('.opcao-multipla').forEach(el => {
                    el.classList.remove('selecionada');
                });
                opcaoElement.classList.add('selecionada');
            }
            
            // Se o feedback for imediato, verificar resposta
            if (prova.cabecalho.feedback && prova.cabecalho.feedback.tipo === 'imediato') {
                verificarRespostaImediata(questao, index);
            }
        });
        
        container.appendChild(opcaoElement);
    });
}

// Função para renderizar questão de verdadeiro ou falso
function renderizarVerdadeiroFalso(container, questao) {
    questao.opcoes.forEach((afirmacao, index) => {
        const opcaoElement = document.createElement('div');
        opcaoElement.className = 'opcao-vf';
        
        const opcaoHTML = `
            <div>
                <input type="radio" id="vf-${index}-true" name="vf-${index}" value="true">
                <label for="vf-${index}-true">Verdadeiro</label>
            </div>
            <div>
                <input type="radio" id="vf-${index}-false" name="vf-${index}" value="false">
                <label for="vf-${index}-false">Falso</label>
            </div>
            <div class="afirmacao">${afirmacao}</div>
        `;
        
        opcaoElement.innerHTML = opcaoHTML;
        
        // Adicionar evento de clique para feedback imediato
        if (prova.cabecalho.feedback && prova.cabecalho.feedback.tipo === 'imediato') {
            const radios = opcaoElement.querySelectorAll('input[type="radio"]');
            radios.forEach(radio => {
                radio.addEventListener('change', () => {
                    verificarRespostaImediata(questao, index);
                });
            });
        }
        
        container.appendChild(opcaoElement);
    });
}

// Função para renderizar questão de associação
function renderizarAssociacao(container, questao) {
    questao.colunaA.forEach((item, index) => {
        const associacaoItem = document.createElement('div');
        associacaoItem.className = 'associacao-item';
        
        const colunaAElement = document.createElement('div');
        colunaAElement.className = 'coluna-a';
        colunaAElement.textContent = item;
        
        const colunaBElement = document.createElement('div');
        colunaBElement.className = 'coluna-b';
        
        const select = document.createElement('select');
        select.dataset.indice = index;
        
        // Adicionar opção vazia
        const optionVazia = document.createElement('option');
        optionVazia.value = '';
        optionVazia.textContent = 'Selecione uma opção';
        select.appendChild(optionVazia);
        
        // Adicionar opções da coluna B
        questao.colunaB.forEach((opcao, indiceB) => {
            const option = document.createElement('option');
            option.value = indiceB;
            option.textContent = opcao;
            select.appendChild(option);
        });
        
        // Adicionar evento de mudança para feedback imediato
        if (prova.cabecalho.feedback && prova.cabecalho.feedback.tipo === 'imediato') {
            select.addEventListener('change', () => {
                verificarRespostaImediata(questao, index);
            });
        }
        
        colunaBElement.appendChild(select);
        
        associacaoItem.appendChild(colunaAElement);
        associacaoItem.appendChild(colunaBElement);
        
        container.appendChild(associacaoItem);
    });
}

// Função para renderizar questão de ordenação
function renderizarOrdenacao(container, questao) {
    const ordenacaoContainer = document.createElement('div');
    ordenacaoContainer.className = 'ordenacao-container';
    
    // Criar itens ordenáveis
    questao.opcoes.forEach((opcao, index) => {
        const item = document.createElement('div');
        item.className = 'ordenacao-item';
        item.dataset.indice = index;
        item.textContent = opcao;
        item.draggable = true;
        
        // Adicionar eventos de drag and drop
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', index);
            item.classList.add('dragging');
        });
        
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
        });
        
        ordenacaoContainer.appendChild(item);
    });
    
    // Adicionar eventos de drop na área de ordenação
    ordenacaoContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingItem = document.querySelector('.dragging');
        const afterElement = getDragAfterElement(ordenacaoContainer, e.clientY);
        
        if (afterElement) {
            ordenacaoContainer.insertBefore(draggingItem, afterElement);
        } else {
            ordenacaoContainer.appendChild(draggingItem);
        }
    });
    
    container.appendChild(ordenacaoContainer);
}

// Função auxiliar para determinar a posição do elemento durante o drag
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.ordenacao-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Função para renderizar questão de completar lacunas
function renderizarCompletarLacunas(container, questao) {
    const completarElement = document.createElement('div');
    completarElement.className = 'completar-lacunas';
    
    // Dividir o texto pelas lacunas (representadas por ___)
    const partes = questao.texto.split('_____');
    
    // Criar o HTML com as lacunas substituídas por selects
    let html = partes[0];
    
    for (let i = 1; i < partes.length; i++) {
        const select = document.createElement('select');
        select.dataset.indice = i - 1;
        
        // Adicionar opção vazia
        const optionVazia = document.createElement('option');
        optionVazia.value = '';
        optionVazia.textContent = 'Selecione';
        select.appendChild(optionVazia);
        
        // Adicionar opções
        questao.opcoes.forEach((opcao, indiceOpcao) => {
            const option = document.createElement('option');
            option.value = indiceOpcao;
            option.textContent = opcao;
            select.appendChild(option);
        });
        
        // Adicionar evento de mudança para feedback imediato
        if (prova.cabecalho.feedback && prova.cabecalho.feedback.tipo === 'imediato') {
            select.addEventListener('change', () => {
                verificarRespostaImediata(questao, i - 1);
            });
        }
        
        completarElement.appendChild(document.createTextNode(partes[i - 1]));
        completarElement.appendChild(select);
        completarElement.appendChild(document.createTextNode(partes[i]));
    }
    
    container.appendChild(completarElement);
}

// Função para verificar resposta imediata
function verificarRespostaImediata(questao, indiceResposta) {
    // Salvar resposta atual
    salvarRespostaAtual();
    
    // Obter resposta salva
    const resposta = respostas[questaoAtual];
    
    // Verificar se a resposta está correta com base no tipo de questão
    let estaCorreto = false;
    
    switch (questao.tipo) {
        case 'multiplaEscolha':
            if (questao.subTipo === 'unica' || questao.subTipo === 'comImagem') {
                estaCorreto = resposta === questao.gabarito;
                
                // Destacar opção correta e incorreta
                document.querySelectorAll('.opcao-multipla').forEach((opcao, i) => {
                    if (i === questao.gabarito) {
                        opcao.classList.add('correta');
                    } else if (i === resposta && resposta !== questao.gabarito) {
                        opcao.classList.add('incorreta');
                    }
                });
            } else if (questao.subTipo === 'multipla') {
                // Verificar se as respostas são iguais (mesma quantidade e mesmos valores)
                const respostaOrdenada = [...resposta].sort((a, b) => a - b);
                const gabaritoOrdenado = [...questao.gabarito].sort((a, b) => a - b);
                estaCorreto = JSON.stringify(respostaOrdenada) === JSON.stringify(gabaritoOrdenado);
                
                // Destacar opções corretas e incorretas
                document.querySelectorAll('.opcao-multipla').forEach((opcao, i) => {
                    const indiceOpcao = parseInt(opcao.dataset.indice);
                    if (questao.gabarito.includes(indiceOpcao)) {
                        opcao.classList.add('correta');
                    } else if (resposta.includes(indiceOpcao)) {
                        opcao.classList.add('incorreta');
                    }
                });
            }
            break;
            
        case 'verdadeiroFalso':
            estaCorreto = JSON.stringify(resposta) === JSON.stringify(questao.gabarito);
            
            // Destacar respostas corretas e incorretas
            resposta.forEach((valor, i) => {
                const radioSelecionado = document.querySelector(`input[name="vf-${i}"]:checked`);
                const labelSelecionado = radioSelecionado ? radioSelecionado.parentElement.querySelector('label') : null;
                
                if (labelSelecionado) {
                    if (valor === questao.gabarito[i]) {
                        labelSelecionado.classList.add('correta');
                    } else {
                        labelSelecionado.classList.add('incorreta');
                    }
                }
            });
            break;
            
        case 'associacao':
            estaCorreto = JSON.stringify(resposta) === JSON.stringify(questao.gabarito);
            
            // Destacar associações corretas e incorretas
            resposta.forEach((valor, i) => {
                const select = document.querySelector(`.associacao-item select[data-indice="${i}"]`);
                
                if (select) {
                    if (valor === questao.gabarito[i]) {
                        select.classList.add('correta');
                    } else {
                        select.classList.add('incorreta');
                    }
                }
            });
            break;
            
        case 'ordenacao':
            estaCorreto = JSON.stringify(resposta) === JSON.stringify(questao.gabarito);
            
            // Destacar ordem correta
            if (!estaCorreto) {
                const ordenacaoContainer = document.querySelector('.ordenacao-container');
                
                // Adicionar indicação visual da ordem correta
                const ordemCorretaElement = document.createElement('div');
                ordemCorretaElement.className = 'ordem-correta';
                ordemCorretaElement.innerHTML = '<h4>Ordem correta:</h4>';
                
                questao.gabarito.forEach(indice => {
                    const itemCorreta = document.createElement('div');
                    itemCorreta.className = 'ordenacao-item-correta';
                    itemCorreta.textContent = questao.opcoes[indice];
                    ordemCorretaElement.appendChild(itemCorreta);
                });
                
                ordenacaoContainer.parentNode.appendChild(ordemCorretaElement);
            }
            break;
            
        case 'completarLacunas':
            estaCorreto = JSON.stringify(resposta) === JSON.stringify(questao.gabarito);
            
            // Destacar lacunas corretas e incorretas
            resposta.forEach((valor, i) => {
                const select = document.querySelector(`.completar-lacunas select[data-indice="${i}"]`);
                
                if (select) {
                    if (valor === questao.gabarito[i]) {
                        select.classList.add('correta');
                    } else {
                        select.classList.add('incorreta');
                    }
                }
            });
            break;
    }
    
    // Exibir mensagem de feedback
    exibirFeedback(estaCorreto, questao);
}

// Função para exibir feedback
function exibirFeedback(estaCorreto, questao) {
    // Remover feedback anterior, se existir
    const feedbackAnterior = document.querySelector('.feedback-mensagem');
    if (feedbackAnterior) {
        feedbackAnterior.remove();
    }
    
    // Criar elemento de feedback
    const feedbackElement = document.createElement('div');
    feedbackElement.className = `feedback-mensagem ${estaCorreto ? 'feedback-correto' : 'feedback-incorreto'}`;
    feedbackElement.textContent = estaCorreto ? 'Resposta correta!' : 'Resposta incorreta!';
    
    // Adicionar ao container da questão
    const questaoElement = document.querySelector(`#questao-${questao.id}`);
    questaoElement.appendChild(feedbackElement);
    
    // Fazer o feedback desaparecer após alguns segundos
    setTimeout(() => {
        feedbackElement.classList.add('feedback-desaparecendo');
        setTimeout(() => {
            feedbackElement.remove();
        }, 1000);
    }, 3000);
}

// Função para restaurar resposta salva
function restaurarRespostaSalva(questao) {
    const resposta = respostas[questaoAtual];
    if (resposta === null) return;
    
    switch (questao.tipo) {
        case 'multiplaEscolha':
            if (questao.subTipo === 'unica' || questao.subTipo === 'comImagem') {
                const opcoes = document.querySelectorAll('.opcao-multipla');
                if (opcoes[resposta]) {
                    opcoes[resposta].classList.add('selecionada');
                }
            } else if (questao.subTipo === 'multipla') {
                resposta.forEach(indice => {
                    const opcoes = document.querySelectorAll('.opcao-multipla');
                    if (opcoes[indice]) {
                        opcoes[indice].classList.add('selecionada');
                    }
                });
            }
            break;
            
        case 'verdadeiroFalso':
            resposta.forEach((valor, indice) => {
                const radio = document.querySelector(`input[name="vf-${indice}"][value="${valor}"]`);
                if (radio) {
                    radio.checked = true;
                }
            });
            break;
            
        case 'associacao':
            resposta.forEach((valor, indice) => {
                if (valor !== null) {
                    const select = document.querySelector(`.associacao-item select[data-indice="${indice}"]`);
                    if (select) {
                        select.value = valor;
                    }
                }
            });
            break;
            
        case 'completarLacunas':
            resposta.forEach((valor, indice) => {
                if (valor !== null) {
                    const select = document.querySelector(`.completar-lacunas select[data-indice="${indice}"]`);
                    if (select) {
                        select.value = valor;
                    }
                }
            });
            break;
    }
}

// Função para atualizar o temporizador
function atualizarTemporizador() {
    if (tempoRestante <= 0) {
        clearInterval(temporizador);
        finalizarProva();
        return;
    }
    
    const minutos = Math.floor(tempoRestante / 60);
    const segundos = tempoRestante % 60;
    
    document.getElementById('minutos').textContent = minutos.toString().padStart(2, '0');
    document.getElementById('segundos').textContent = segundos.toString().padStart(2, '0');
    
    tempoRestante--;
}

// Função para navegar entre as questões
function navegarQuestao(direcao) {
    // Salvar resposta atual antes de navegar
    salvarRespostaAtual();
    
    // Calcular nova posição
    const novaQuestao = questaoAtual + direcao;
    
    // Verificar se a nova posição é válida
    if (novaQuestao >= 0 && novaQuestao < prova.questoes.length) {
        carregarQuestao(novaQuestao);
    }
}

// Função para salvar a resposta da questão atual
function salvarRespostaAtual() {
    const questao = prova.questoes[questaoAtual];
    let resposta = null;
    
    switch (questao.tipo) {
        case 'multiplaEscolha':
            if (questao.subTipo === 'unica' || questao.subTipo === 'comImagem') {
                const opcaoSelecionada = document.querySelector(`.opcao-multipla.selecionada`);
                if (opcaoSelecionada) {
                    resposta = parseInt(opcaoSelecionada.dataset.indice);
                }
            } else if (questao.subTipo === 'multipla') {
                resposta = [];
                document.querySelectorAll(`.opcao-multipla.selecionada`).forEach(opcao => {
                    resposta.push(parseInt(opcao.dataset.indice));
                });
            }
            break;
            
        case 'verdadeiroFalso':
            resposta = [];
            document.querySelectorAll(`.opcao-vf input[type="radio"]:checked`).forEach((input, index) => {
                resposta[index] = input.value === 'true';
            });
            break;
            
        case 'associacao':
            resposta = [];
            document.querySelectorAll(`.associacao-item select`).forEach(select => {
                if (select.value !== '') {
                    resposta.push(parseInt(select.value));
                } else {
                    resposta.push(null);
                }
            });
            break;
            
        case 'ordenacao':
            resposta = [];
            document.querySelectorAll(`.ordenacao-item`).forEach(item => {
                resposta.push(parseInt(item.dataset.indice));
            });
            break;
            
        case 'completarLacunas':
            resposta = [];
            document.querySelectorAll(`.completar-lacunas select`).forEach(select => {
                if (select.value !== '') {
                    resposta.push(parseInt(select.value));
                } else {
                    resposta.push(null);
                }
            });
            break;
    }
    
    respostas[questaoAtual] = resposta;
    console.log(`Resposta da questão ${questaoAtual + 1} salva:`, resposta);
}

// Função para finalizar a prova
function finalizarProva() {
    // Salvar a resposta da última questão
    salvarRespostaAtual();
    
    // Parar o temporizador se estiver ativo
    if (temporizador) {
        clearInterval(temporizador);
    }
    
    // Calcular pontuação
    const resultado = calcularPontuacao();
    
    // Exibir resultado
    document.getElementById('pontos-obtidos').textContent = resultado.pontuacao;
    document.getElementById('percentual').textContent = `${resultado.percentual}%`;
    
    // Gerar resumo das questões
    gerarResumoQuestoes(resultado.detalhes);
    
    // Esconder container de questões e mostrar resultado
    document.getElementById('questoes-container').classList.add('hidden');
    document.getElementById('navegacao-questoes').classList.add('hidden');
    document.getElementById('acoes-prova').classList.add('hidden');
    document.getElementById('resultado-container').classList.remove('hidden');
}

// Função para calcular a pontuação
function calcularPontuacao() {
    let pontuacaoTotal = 0;
    const detalhes = [];
    
    prova.questoes.forEach((questao, index) => {
        const resposta = respostas[index];
        let acertou = false;
        let pontuacaoQuestao = 0;
        
        if (resposta !== null) {
            switch (questao.tipo) {
                case 'multiplaEscolha':
                    if (questao.subTipo === 'unica' || questao.subTipo === 'comImagem') {
                        acertou = resposta === questao.gabarito;
                    } else if (questao.subTipo === 'multipla') {
                        // Verificar se as respostas são iguais (mesma quantidade e mesmos valores)
                        const respostaOrdenada = [...resposta].sort((a, b) => a - b);
                        const gabaritoOrdenado = [...questao.gabarito].sort((a, b) => a - b);
                        acertou = JSON.stringify(respostaOrdenada) === JSON.stringify(gabaritoOrdenado);
                    }
                    break;
                    
                case 'verdadeiroFalso':
                    acertou = JSON.stringify(resposta) === JSON.stringify(questao.gabarito);
                    break;
                    
                case 'associacao':
                case 'ordenacao':
                case 'completarLacunas':
                    acertou = JSON.stringify(resposta) === JSON.stringify(questao.gabarito);
                    break;
            }
        }
        
        if (acertou) {
            pontuacaoQuestao = questao.pontuacao;
            pontuacaoTotal += pontuacaoQuestao;
        }
        
        detalhes.push({
            questao: index + 1,
            acertou,
            pontuacao: pontuacaoQuestao,
            pontuacaoMaxima: questao.pontuacao
        });
    });
    
    const percentual = Math.round((pontuacaoTotal / prova.cabecalho.pontuacaoTotal) * 100);
    
    return {
        pontuacao: pontuacaoTotal,
        percentual,
        detalhes
    };
}

// Função para gerar o resumo das questões
function gerarResumoQuestoes(detalhes) {
    const resumoContainer = document.getElementById('resumo-questoes');
    resumoContainer.innerHTML = '';
    
    detalhes.forEach(detalhe => {
        const resumoItem = document.createElement('div');
        resumoItem.className = `resumo-item ${detalhe.acertou ? 'acerto' : 'erro'}`;
        
        const questao = prova.questoes[detalhe.questao - 1];
        
        resumoItem.innerHTML = `
            <h4>Questão ${detalhe.questao}: ${detalhe.acertou ? 'Correta' : 'Incorreta'}</h4>
            <p>${questao.enunciado}</p>
            <p class="resumo-pontuacao">Pontuação: ${detalhe.pontuacao}/${detalhe.pontuacaoMaxima}</p>
        `;
        
        resumoContainer.appendChild(resumoItem);
    });
}

// Função para reiniciar a prova
function reiniciarProva() {
    // Resetar variáveis
    questaoAtual = 0;
    respostas = new Array(prova.questoes.length).fill(null);
    
    // Esconder resultado e mostrar instruções
    document.getElementById('resultado-container').classList.add('hidden');
    document.getElementById('instrucoes').classList.remove('hidden');
    
    // Resetar temporizador
    if (prova.cabecalho.temporizador && prova.cabecalho.temporizador.ativo) {
        tempoRestante = prova.cabecalho.temporizador.tempoEmMinutos * 60;
        document.getElementById('timer-container').classList.add('hidden');
    }
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Configurar eventos para os botões da página de entrada
    document.getElementById('carregar-arquivo').addEventListener('click', () => {
        const inputArquivo = document.getElementById('arquivo-json');
        if (inputArquivo.files.length > 0) {
            carregarProvaDeArquivo(inputArquivo.files[0]);
        } else {
            mostrarErro('Por favor, selecione um arquivo JSON para carregar.');
        }
    });
    
    document.getElementById('carregar-texto').addEventListener('click', () => {
        const textoJson = document.getElementById('json-texto').value.trim();
        if (textoJson) {
            carregarProvaDeTexto(textoJson);
        } else {
            mostrarErro('Por favor, cole o conteúdo JSON da prova.');
        }
    });

    // Carregar catálogo de provas ao iniciar
    carregarCatalogo();

    // Configurar evento para o botão de iniciar prova
    document.getElementById('iniciar-prova').addEventListener('click', iniciarProva);
    
    // Configurar eventos para os botões de navegação
    document.getElementById('anterior').addEventListener('click', () => navegarQuestao(-1));
    document.getElementById('proxima').addEventListener('click', () => navegarQuestao(1));
    
    // Configurar evento para o botão de finalizar prova
    document.getElementById('finalizar-prova').addEventListener('click', finalizarProva);
    
    // Configurar evento para o botão de reiniciar prova
    document.getElementById('reiniciar-prova').addEventListener('click', reiniciarProva);
    
    // Configurar evento para o botão de voltar ao início
    document.getElementById('voltar-inicio').addEventListener('click', () => {
        // Resetar variáveis
        prova = null;
        questaoAtual = 0;
        respostas = [];
        
        // Parar o temporizador se estiver ativo
        if (temporizador) {
            clearInterval(temporizador);
            temporizador = null;
        }
        
        // Esconder o container da prova e mostrar o container de entrada
        document.getElementById('prova-container').classList.add('hidden');
        document.getElementById('resultado-container').classList.add('hidden');
        document.getElementById('entrada-container').classList.remove('hidden');

        // Limpar campos
        document.getElementById('arquivo-json').value = '';
        document.getElementById('json-texto').value = '';

        // Voltar à raiz do catálogo
        if (catalogo) {
            renderizarModulos();
        }
    });
});
