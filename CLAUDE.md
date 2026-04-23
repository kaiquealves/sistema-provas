# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static single-page exam-taking app (vanilla HTML/CSS/JS, no build system, no dependencies, no tests). UI strings and identifiers are in Portuguese (pt-BR). Entry point is `index.html`; all app logic lives in `script.js`; styling is split between `styles.css` (layout/components + catalog UI) and `feedback.css` (correct/incorrect states + animations).

The app supports multiple exam modules via a catalog (`catalogo.json`). The two initial modules are **Educação Infantil** (grouped by year/subject) and **Certificação em TI** (grouped by provider/certification).

## Running locally

There is no build, lint, or test command. Serve the directory over HTTP so the catalog and the exam JSON files can be fetched — opening `index.html` via `file://` breaks the catalog (only the "Carregar arquivo"/"Colar JSON" paths still work).

```
python3 -m http.server 8000
# then open http://localhost:8000
```

## Architecture

**Single global state in `script.js`**, split in two groups:
- Prova-in-progress: `prova` (loaded JSON), `questaoAtual` (index), `respostas` (array parallel to `prova.questoes`), `temporizador` / `tempoRestante`.
- Catálogo: `catalogo` (parsed `catalogo.json`), `moduloAtualCatalogo`, `nivelAtualCatalogo` (track the drilldown position).

There is no module system or framework — the whole app is top-level functions wired up inside a single `DOMContentLoaded` handler at the bottom of the file, which calls `carregarCatalogo()` on load.

**Screen flow** is driven by toggling the `hidden` class on three top-level `<div>`s in `index.html`: `#entrada-container` (catalog + advanced load options) → `#prova-container` (with nested `#instrucoes` → `#questoes-container`) → `#resultado-container`. Only one question is rendered at a time; navigating calls `salvarRespostaAtual()` then `carregarQuestao(novoIndice)`, which wipes `#questoes-container` and rebuilds it from the JSON.

**Catalog drilldown** (three levels, rendered inside `#catalogo-container`, with `#catalogo-breadcrumb` above):
1. `renderizarModulos()` — grid of module cards from `catalogo.modulos[]`.
2. `renderizarNiveis(moduloId)` — grid of nivel cards from the selected module's `niveis[]`. Each module can override the label ("Ano" for educação infantil, "Provedor" for certificação TI) via `rotuloNivel`.
3. `renderizarProvasDoNivel(nivelId)` — for each `materia` under the nivel, render a section with its provas listed inline, each with an "Iniciar" button. The `rotuloMateria` field on the module controls the visible label ("Matéria" vs "Certificação").

Clicking "Iniciar" calls `carregarProvaDoCatalogo(arquivo)`, which fetches the exam JSON at the path declared in `catalogo.json` and hands it to the shared `carregarProvaDeObjeto()` — the same function used by the file-upload and paste-JSON paths.

**Adding a new exam**: drop the JSON file anywhere under `provas/<modulo>/<nivel>/<materia>/` and register it inside `catalogo.json` with `id`, `titulo`, and `arquivo` (path relative to the site root). New modules/níveis/matérias are added by appending entries at the corresponding level of `catalogo.json`.

**Question-type dispatch** is the core pattern of the exam engine. Each of the five `tipo` values has a matched triple of functions that must stay in sync when adding/changing a type:
- `renderizar<Tipo>()` — builds DOM for the question
- `salvarRespostaAtual()` case — reads DOM back into `respostas[questaoAtual]`
- `calcularPontuacao()` case — compares stored answer to `gabarito`
- (and if immediate feedback is supported) the `verificarRespostaImediata()` case + `restaurarRespostaSalva()` case

The five types: `multiplaEscolha` (with `subTipo`: `unica` | `multipla` | `comImagem`), `verdadeiroFalso`, `associacao` (colunaA → colunaB), `ordenacao` (HTML5 drag-and-drop), `completarLacunas` (split `texto` on the literal token `_____` and inject `<select>`s).

**Answer shapes in `respostas[]`** differ by type and must match the `gabarito` shape in the JSON:
- `multiplaEscolha` unica/comImagem → single int index; `multipla` → array of ints (compared as sorted JSON)
- `verdadeiroFalso` → array of booleans, one per `opcoes` entry
- `associacao` → array of colunaB indices aligned to colunaA order
- `ordenacao` → array of original `opcoes` indices in current DOM order
- `completarLacunas` → array of `opcoes` indices, one per lacuna

**Exam JSON schema** (see `provas/educacao-infantil/4-ano/ciencias/transformacao-materiais.json` for the canonical example): top-level `cabecalho` (disciplina, serie, tema, pontuacaoTotal, optional `temporizador {ativo, tempoEmMinutos}`, `feedback {tipo: "imediato"|"final", mostrarGabarito}`) plus `questoes[]`. `cabecalho.feedback.tipo === "imediato"` wires per-option change listeners that call `verificarRespostaImediata` and paint `.correta`/`.incorreta` on the DOM.

**Catalog JSON schema** (`catalogo.json`): `modulos[]`, each with `id`, `nome`, `descricao`, optional `rotuloNivel`/`rotuloMateria` (display-only labels), and `niveis[]`. Each nivel has `id`, `nome`, `materias[]`. Each materia has `id`, `nome`, `provas[]`. Each prova has `id`, `titulo`, `arquivo` (path to the exam JSON, resolved relative to `index.html`).

**Images** referenced via `questao.imagem` are resolved relative to `index.html` (e.g. `images/poluicao_ar.jpg`).
