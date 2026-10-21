# openhermes: mapeamento prévia → Hermes real

Cada elemento da prévia e onde ele encaixa no Hermes de verdade.

| Prévia | Hermes real |
|---|---|
| Flag de layout | `display.layout` (`classic` padrão, `opencode` opt-in) no Ink TUI |
| Inicial limpa, logo, caixa | Nova view de boas-vindas em `ui-tui/src/`; composer existente |
| Linha `AGENTE · modelo · max` | Composer + modelo ativo + `reasoning_effort` |
| SMART / YOLO | `approvals` smart / off (`/yolo`, `--yolo`) |
| PLAN | Envia `/plan <prompt>` (`COMMAND_REGISTRY` em `hermes_cli/commands.py`) |
| Paleta Commands | Overlay novo no TUI com as mesmas ações |
| Trocar sessão / abas | Sessões em `state.db` (`hermes sessions list/browse/rename/delete`) |
| Trocar modelo | Picker `hermes model` |
| Settings | `hermes config set <chave> <valor>` por linha |
| Temas (33) | `themes/*.yaml` → `<hermes-home>/skins/` (`hermes skin use`, `/skin`) |
| Modo de cor | Variante claro/escuro do skin (`-light`) |
| Mudar nome | `branding.agent_name` do skin ativo |
| Slash `/` | `COMMAND_REGISTRY` (`/help` é a autoridade), sem comandos de gateway |
| Rodapé ferramentas/skills | Contagens reais de toolsets e skills instalados |
| Meta do turno | Dados reais de modelo, tempo e tokens da sessão |

## Fontes de verdade usadas

- Cores: binário oficial do OpenCode 2.0.32 (registro `ue` + tema `opencode`), tokens por modo resolvidos por referência.
- Slashes: `references/slash-commands.md` da skill hermes-agent (registro em `hermes_cli/commands.py`).
- Comportamento: capturas tmux do binário instalado (120x40, 120x30, diretório limpo para estado zero).
