# openhermes

The OpenCode look on Hermes Agent. An opt-in layout for the Ink TUI (`hermes --tui`) that faithfully replicates the appearance and behavior of OpenCode 2, while keeping 100% of the Hermes tools, memory, gateway, and skills. Nothing in the classic CLI changes.

Community project, not affiliated with SST (OpenCode) or Nous Research (Hermes Agent).

## What's in this repo

| Path/file | What it is |
|---|---|
| `themes/` | 66 ready-to-use skins for `~/.hermes/skins/`: the 33 real OpenCode 2.0.32 themes in dark (`oh-dracula.yaml`) and light (`oh-dracula-light.yaml`) modes, with values extracted from the official binary |
| `preview/` | Approved clickable preview of the full layout (single HTML file, open it in a browser) |
| `specs/layout.md` | Exact behavioral spec: every screen, every shortcut, every rule |
| `specs/mapping.md` | Every preview element mapped to the real Hermes system (file or command) |
| `SKILL.md` | Instructions for your Hermes to build the layout step by step, with no errors |
| `scripts/` | Skin validator and preview server |

## Prerequisites

- Hermes Agent installed and working (`hermes --version` answers)
- A configured model (`hermes model` has run at least once)
- Python 3 for the scripts (that's all, no dependencies)

## Installing the skins (2 minutes)

```bash
# 1. Copy the skins
cp openhermes/themes/*.yaml ~/.hermes/skins/

# 2. Enable one (example: the default OpenCode theme, dark mode)
hermes config set display.skin oh-opencode

# 3. Switch back whenever you want
hermes config set display.skin default
```

Never hand-edit `config.yaml` for this. Always use `hermes config set`.

## How to ask your Hermes to build the layout

The layout (screens, palette, tabs, shortcuts) is still built by the agent following the spec. Paste this into your Hermes:

```
Read the openhermes repo's SKILL.md and run Phase 1 (skins + the
display.layout flag). Only move to the next phase once I approve the current one.
```

Or install the skill directly:

```bash
hermes skills install https://github.com/<you>/openhermes/blob/main/SKILL.md
```

## Verification (how to tell it worked)

1. `hermes config get display.skin` shows `oh-opencode`
2. `hermes --tui` opens the clean centered home screen, with no tools panel
3. Ctrl+P opens Commands with the full menu before typing anything
4. Typing `theme` filters down to 1 item; Enter opens the 33 themes
5. Shift+Tab cycles SMART, PLAN, and YOLO on the input box line
6. Typing `/` opens autocomplete with the Hermes slash commands
7. A new tab via `+` opens the clean home; once you type it becomes a conversation and `+` comes back

## Themes

Extracted from the official OpenCode 2.0.32 binary (registry variable `ue` plus the `opencode` theme), with light and dark modes resolved per token: background, text, muted, accent, selection, agent, variant, panel, band, border, diffs, and syntax. OpenCode's `system` mode follows the terminal; on Hermes, switch between `oh-<name>` and `oh-<name>-light`.

## Status

- HTML preview: approved, covered by 20 executable checks
- Skins: generated and validated (`scripts/validate_skins.py`), recognized by the real Hermes
- TUI port: phases 1–4 implemented and verified on the `openhermes` branch
  (clean typecheck, 1633 green tests, live smoke test in the terminal);
  patch exported in `patches/001-fases-1-4.patch`
- Missing: custom name in the TUI (needs a new gateway RPC, phase 5)

## License

MIT. Theme colors belong to their original authors.
