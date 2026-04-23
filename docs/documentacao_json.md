# Documentação do Formato JSON para o Sistema de Provas

Este documento descreve o formato JSON utilizado pelo Sistema de Provas para definir e configurar provas com diferentes tipos de questões.

## Estrutura Geral

O arquivo JSON de uma prova é composto por duas seções principais:

1. **Cabeçalho** (`cabecalho`): Contém informações gerais sobre a prova
2. **Questões** (`questoes`): Lista de questões que compõem a prova

Exemplo da estrutura básica:

```json
{
  "cabecalho": {
    // Informações gerais da prova
  },
  "questoes": [
    // Lista de questões
  ]
}
```

## Cabeçalho da Prova

O cabeçalho contém metadados e configurações gerais da prova:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `disciplina` | String | Nome da disciplina da prova |
| `serie` | String | Série ou nível educacional |
| `tema` | String | Tema ou assunto da prova |
| `pontuacaoTotal` | Number | Pontuação total da prova |
| `temporizador` | Object | Configurações do temporizador |
| `feedback` | Object | Configurações de feedback |

### Configurações do Temporizador

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `ativo` | Boolean | Define se o temporizador está ativo |
| `tempoEmMinutos` | Number | Tempo em minutos para realizar a prova |

### Configurações de Feedback

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `tipo` | String | Tipo de feedback: "imediato" ou "final" |
| `mostrarGabarito` | Boolean | Define se o gabarito será mostrado |

Exemplo de cabeçalho:

```json
"cabecalho": {
  "disciplina": "Ciências",
  "serie": "4º ano do Ensino Fundamental",
  "tema": "Transformação dos Materiais e Meio Ambiente",
  "pontuacaoTotal": 100,
  "temporizador": {
    "ativo": true,
    "tempoEmMinutos": 45
  },
  "feedback": {
    "tipo": "final",
    "mostrarGabarito": true
  }
}
```

## Questões

Cada questão é representada por um objeto com os seguintes campos comuns:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | Number | Identificador único da questão |
| `tipo` | String | Tipo da questão (ver tipos suportados abaixo) |
| `enunciado` | String | Texto do enunciado da questão |
| `pontuacao` | Number | Valor da questão em pontos |
| `gabarito` | Varia | Resposta(s) correta(s) (formato varia conforme o tipo) |

Além desses campos comuns, cada tipo de questão pode ter campos específicos.

## Tipos de Questões Suportados

### 1. Múltipla Escolha (Resposta Única)

```json
{
  "id": 1,
  "tipo": "multiplaEscolha",
  "subTipo": "unica",
  "enunciado": "Qual das seguintes ações ajuda a reduzir a poluição do ar?",
  "pontuacao": 6,
  "opcoes": [
    "Usar mais carros nas cidades",
    "Andar de bicicleta ou a pé",
    "Queimar lixo no quintal",
    "Deixar as luzes acesas quando não estamos no ambiente"
  ],
  "gabarito": 1
}
```

- `subTipo`: Deve ser "unica"
- `opcoes`: Array de strings com as alternativas
- `gabarito`: Índice (começando em 0) da opção correta

### 2. Múltipla Escolha (Múltiplas Respostas)

```json
{
  "id": 3,
  "tipo": "multiplaEscolha",
  "subTipo": "multipla",
  "enunciado": "Quais dos seguintes materiais podem ser reciclados?",
  "pontuacao": 7,
  "opcoes": [
    "Papel",
    "Vidro",
    "Plástico",
    "Pilhas e baterias"
  ],
  "gabarito": [0, 1, 2, 3]
}
```

- `subTipo`: Deve ser "multipla"
- `opcoes`: Array de strings com as alternativas
- `gabarito`: Array de índices das opções corretas

### 3. Múltipla Escolha com Imagem

```json
{
  "id": 7,
  "tipo": "multiplaEscolha",
  "subTipo": "comImagem",
  "enunciado": "Observe a imagem e identifique qual tipo de poluição está sendo mostrada:",
  "imagem": "images/poluicao_ar.jpg",
  "pontuacao": 6,
  "opcoes": [
    "Poluição do ar",
    "Poluição da água",
    "Poluição do solo",
    "Poluição sonora"
  ],
  "gabarito": 0
}
```

- `subTipo`: Deve ser "comImagem"
- `imagem`: Caminho para o arquivo de imagem
- `opcoes`: Array de strings com as alternativas
- `gabarito`: Índice da opção correta

### 4. Verdadeiro ou Falso

```json
{
  "id": 2,
  "tipo": "verdadeiroFalso",
  "enunciado": "Marque verdadeiro ou falso para as afirmações sobre a água:",
  "pontuacao": 8,
  "opcoes": [
    "A água pode existir nos estados sólido, líquido e gasoso.",
    "A água poluída não pode ser tratada de nenhuma forma.",
    "O ciclo da água é um processo natural importante para o planeta.",
    "Economizar água não é importante, pois ela nunca acaba."
  ],
  "gabarito": [true, false, true, false]
}
```

- `opcoes`: Array de strings com as afirmações
- `gabarito`: Array de booleanos (true/false) correspondentes a cada afirmação

### 5. Associação

```json
{
  "id": 4,
  "tipo": "associacao",
  "enunciado": "Associe cada material à sua característica principal:",
  "pontuacao": 8,
  "colunaA": [
    "Madeira",
    "Metal",
    "Plástico",
    "Vidro"
  ],
  "colunaB": [
    "Conduz bem eletricidade e calor",
    "Transparente e frágil",
    "Vem de árvores",
    "Feito de petróleo"
  ],
  "gabarito": [2, 0, 3, 1]
}
```

- `colunaA`: Array de strings com os itens da primeira coluna
- `colunaB`: Array de strings com os itens da segunda coluna
- `gabarito`: Array de índices indicando a qual item da colunaB cada item da colunaA corresponde

### 6. Ordenação

```json
{
  "id": 5,
  "tipo": "ordenacao",
  "enunciado": "Coloque na ordem correta as etapas do ciclo da água:",
  "pontuacao": 6,
  "opcoes": [
    "Evaporação",
    "Condensação",
    "Precipitação",
    "Infiltração"
  ],
  "gabarito": [0, 1, 2, 3]
}
```

- `opcoes`: Array de strings com os itens a serem ordenados
- `gabarito`: Array de índices indicando a ordem correta dos itens

### 7. Completar Lacunas

```json
{
  "id": 6,
  "tipo": "completarLacunas",
  "enunciado": "Complete as frases sobre transformações dos materiais:",
  "pontuacao": 7,
  "texto": "Quando a água é aquecida, ela passa do estado _____ para o estado _____. Quando a água é congelada, ela passa do estado _____ para o estado _____.",
  "opcoes": ["líquido", "gasoso", "sólido"],
  "gabarito": [0, 1, 0, 2]
}
```

- `texto`: String com o texto contendo lacunas (representadas por `_____`)
- `opcoes`: Array de strings com as opções para preencher as lacunas
- `gabarito`: Array de índices indicando qual opção deve ser usada em cada lacuna

## Exemplo Completo

Veja o arquivo `prova_ciencias.json` para um exemplo completo de uma prova com 15 questões de diferentes tipos.

## Dicas para Criar Provas

1. Certifique-se de que o JSON esteja bem formatado e válido
2. Cada questão deve ter um ID único
3. A pontuação total no cabeçalho deve corresponder à soma das pontuações de todas as questões
4. Para questões com imagens, verifique se os caminhos das imagens estão corretos
5. Os gabaritos devem seguir o formato específico de cada tipo de questão

## Validação do JSON

Você pode validar seu arquivo JSON usando ferramentas online como:
- [JSONLint](https://jsonlint.com/)
- [JSON Validator](https://jsonformatter.curiousconcept.com/)

## Considerações Finais

Este formato JSON foi projetado para ser flexível e suportar diversos tipos de questões. Você pode criar suas próprias provas seguindo esta estrutura e carregá-las no Sistema de Provas através das opções de upload de arquivo ou colagem de texto.
