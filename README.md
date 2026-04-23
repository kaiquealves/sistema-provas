# sistema-provas

Sistema de provas a partir de arquivos JSON, com catálogo de múltiplos módulos:

- **Educação Infantil** — organizada por ano e matéria (ex.: 4º ano → Ciências, Matemática)
- **Certificação em TI** — organizada por provedor e certificação (ex.: AWS → Cloud Practitioner, Microsoft → AZ-900)

## Como executar

O catálogo e as provas pré-definidas são carregados via `fetch`, então é preciso servir o diretório por HTTP:

```
python3 -m http.server 8000
# abra http://localhost:8000
```

Abrir o `index.html` direto pelo navegador (`file://`) só funciona nas opções "Carregar arquivo" e "Colar JSON".

## Estrutura

```
catalogo.json                       # índice de todos os módulos/provas
provas/
  educacao-infantil/
    4-ano/
      ciencias/
        transformacao-materiais.json
      matematica/
        operacoes-basicas.json
  certificacao-ti/
    aws/
      cloud-practitioner/
        simulado-01.json
    microsoft/
      az-900/
        simulado-01.json
```

## Como adicionar uma nova prova

1. Criar o arquivo JSON da prova em `provas/<modulo>/<nivel>/<materia>/<id>.json` seguindo o mesmo formato das provas existentes (`cabecalho` + `questoes`).
2. Registrar a prova no `catalogo.json`, dentro do módulo → nível → matéria correspondente, com `id`, `titulo` e `arquivo` (caminho relativo).

Se o módulo, nível ou matéria ainda não existir, basta adicioná-lo no `catalogo.json`.
