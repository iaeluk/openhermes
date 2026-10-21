---
name: openhermes-build
description: "Build the openhermes layout (OpenCode face on Hermes Ink TUI) phase by phase."
version: 1.0.0
license: MIT
---

# openhermes build

> Caminho rápido primeiro: se o checkout é o Hermes 0.22.2 (`d923a5eb48`),
> rode `scripts/apply.sh` e pule para a Verificação final. As fases abaixo
> são para checkouts onde o patch não aplica.

Construa o layout openhermes no Hermes Ink TUI em fases, com aprovação do Lucas entre elas. Escopo: só o Ink TUI (`hermes --tui`), opt-in via `display.layout: opencode`. O CLI clássico não muda.

## Antes de começar

1. Leia `specs/layout.md` e `specs/mapping.md` por completo.
2. Confirme `hermes --version` e o repo do Hermes local (`~/.hermes/hermes-agent`).
3. Rode `scripts/validate_skins.py` e só prossiga com 66 skins válidas.

## Fases (uma por vez, com aprovação)

### Fase 1: skins + flag
- Copie `themes/*.yaml` para `<hermes-home>/skins/` (resolva o home real via `$HERMES_HOME`, nunca hardcode `~/.hermes` com perfil ativo).
- Ative com `hermes config set display.skin oh-opencode`. Reversão: `display.skin default`.
- Adicione `display.layout` (`classic` padrão, `opencode` opt-in) lido pelo TUI. Nada muda no padrão.

### Fase 2: inicial + conversa
- Estado vazio: sem barra de abas, logo + caixa centralizados, rodapé com contagens reais de ferramentas e skills.
- Conversa: transcript full-width, mensagem do usuário em faixa com borda lateral de destaque (sem caracteres de caixa), resposta em texto corrido, meta com agente em destaque, caixa fixa acima do rodapé independente do tamanho da conversa.

### Fase 3: paleta Ctrl+P
- Menu completo antes de digitar, filtro que esconde grupos vazios, primeiro resultado auto-selecionado, seleção em barra sólida com contraste, Enter executa, esc volta um nível.
- Views: Commands, Settings (chaves reais via `hermes config set`), Themes (33 + claro/escuro + prévia ao vivo), Models, Sessions (abas reais), Name.

### Fase 4: abas, agentes e slash
- Abas por sessão: `+` abre inicial limpa, some enquanto a aba é nova, volta após digitar; clique na área toda, × fecha, reabertura por pilha; atalhos ctrl+x l/m/n/w/a e ctrl+o.
- Shift+Tab alterna SMART (approvals smart), PLAN (envia como `/plan <prompt>`), YOLO (approvals off).
- Autocomplete de `/` acima da caixa lendo do `COMMAND_REGISTRY` (`/help` é a autoridade), sem comandos exclusivos de gateway.

## Invariantes (nunca violar)

- Nunca quebre o layout classic nem o CLI prompt_toolkit.
- Nunca edite `config.yaml` na mão; use `hermes config set`.
- Nunca faça fork do skin `default` para ajuste; edite o skin ativo.
- Mudança de toolset vale em sessão nova (`/reset`), o que combina com abas.
- Não narreobras: cada fase termina com comandos de verificação executados de verdade.

## Verificação final

Reproduza os 20 checks da prévia (abrir, filtrar, temas, settings, modelos, sessões, abas, nome, agentes, atalhos, conversa) contra o TUI real e reporte o que foi executado.
