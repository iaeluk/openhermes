# openhermes

A cara do OpenCode no Hermes Agent. Um layout opt-in para o Ink TUI (`hermes --tui`) que replica fielmente a aparência e o comportamento do OpenCode 2, mantendo 100% das ferramentas, memória, gateway e skills do Hermes. Nada do CLI clássico muda.

Projeto comunitário, sem afiliação com a SST (OpenCode) nem com a Nous Research (Hermes Agent).

## O que vem neste repo

| Pasta/arquivo | O que é |
|---|---|
| `themes/` | 66 skins prontas para `~/.hermes/skins/`: os 33 temas reais do OpenCode 2.0.32 em modo escuro (`oh-dracula.yaml`) e claro (`oh-dracula-light.yaml`), com valores extraídos do binário oficial |
| `preview/` | Prévia clicável aprovada do layout completo (HTML único, abra no navegador) |
| `specs/layout.md` | Especificação comportamental exata: cada tela, cada atalho, cada regra |
| `specs/mapping.md` | Cada elemento da prévia mapeado para o sistema real do Hermes (arquivo ou comando) |
| `SKILL.md` | Instruções para o seu Hermes construir o layout passo a passo, sem erro |
| `scripts/` | Validador das skins e servidor da prévia |

## Pré-requisitos

- Hermes Agent instalado e funcionando (`hermes --version` responde)
- Um modelo configurado (`hermes model` já passou ao menos uma vez)
- Python 3 para os scripts (só isso, sem dependências)

## Instalação das skins (2 minutos)

```bash
# 1. Copie as skins
cp openhermes/themes/*.yaml ~/.hermes/skins/

# 2. Ative uma (exemplo: o tema padrão do OpenCode, modo escuro)
hermes config set display.skin oh-opencode

# 3. Volte quando quiser
hermes config set display.skin default
```

Nunca edite `config.yaml` na mão para isso. Use sempre `hermes config set`.

## Como pedir ao seu Hermes para construir o layout

O layout (telas, paleta, abas, atalhos) ainda é construído pelo agente seguindo a spec. Cole isto no seu Hermes:

```
Leia SKILL.md do repo openhermes e execute a Fase 1 (skins + flag
display.layout). Só avance de fase quando eu aprovar a anterior.
```

Ou instale a skill direto:

```bash
hermes skills install https://github.com/<voce>/openhermes/blob/main/SKILL.md
```

## Verificação (como saber que funcionou)

1. `hermes config get display.skin` mostra `oh-opencode`
2. `hermes --tui` abre a tela inicial limpa centralizada, sem painel de ferramentas
3. Ctrl+P abre Commands com o menu completo antes de digitar
4. Digitar `theme` filtra e mostra 1 item; Enter abre os 33 temas
5. Shift+Tab alterna SMART, PLAN e YOLO na linha da caixa
6. Digitar `/` abre o autocomplete com os slashes do Hermes
7. Nova aba pelo `+` abre a inicial limpa; digitou, virou conversa e o `+` volta

## Temas

Extraídos do binário oficial do OpenCode 2.0.32 (variável de registro `ue` mais o tema `opencode`), modos claro e escuro resolvidos por token: fundo, texto, atenuado, destaque, seleção, agente, variante, painel, faixa, borda, diffs e sintaxe. O modo `system` do OpenCode segue o terminal; no Hermes, troque entre `oh-<nome>` e `oh-<nome>-light`.

## Status

- Prévia HTML: aprovada, coberta por 20 checks executáveis
- Skins: geradas e validadas (`scripts/validate_skins.py`), reconhecidas pelo Hermes real
- Porte do TUI: fases 1 a 4 implementadas e verificadas no branch `openhermes`
  (typecheck limpo, 1633 testes verdes, fumaça ao vivo no terminal);
  patch exportado em `patches/001-fases-1-4.patch`
- Falta: nome customizado no TUI (precisa de RPC novo no gateway, fase 5)

## Licença

MIT. As cores dos temas pertencem aos seus autores originais.
