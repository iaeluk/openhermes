import { Box, Text, useInput } from '@hermes/ink'
import { useStore } from '@nanostores/react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'

import { applySkin } from '../app/createGatewayEventHandler.js'
import { useGateway } from '../app/gatewayContext.js'
import { patchOverlayState } from '../app/overlayStore.js'
import { $uiState, patchUiState } from '../app/uiStore.js'
import type { GatewaySkin } from '../gatewayTypes.js'
import { detectLightMode } from '../theme.js'
import type { Theme } from '../theme.js'

import { windowOffset } from './overlayControls.js'

// openhermes Fase 3: Ctrl+P command palette. Views: commands, settings,
// themes. Models/sessions reuse the existing pickers. Name (skin branding)
// needs a backend RPC first — see TODO in Fase 5 notes, not shipped here.

type View = 'commands' | 'name' | 'settings' | 'themes'

const THEME_NAMES = [
  'aura', 'ayu', 'carbonfox', 'catppuccin', 'catppuccin-frappe',
  'catppuccin-macchiato', 'cobalt2', 'cursor', 'dracula', 'everforest',
  'flexoki', 'github', 'gruvbox', 'kanagawa', 'lucent-orng', 'material',
  'matrix', 'mercury', 'monokai', 'nightowl', 'nord', 'one-dark',
  'opencode', 'orng', 'osaka-jade', 'palenight', 'rosepine', 'solarized',
  'synthwave84', 'tokyonight', 'vercel', 'vesper', 'zenburn'
]

const COLOR_MODES = ['auto', 'light', 'dark']

// openhermes: exact port of the preview theme rules. A theme NAME resolves
// to `oh-<name>` (dark) or `oh-<name>-light` through the effective color
// mode: explicit light/dark wins, `auto` follows terminal detection.
export const themeNameFromSkin = (skin: string): string | null => {
  const m = /^oh-(.+?)(-light)?$/.exec(skin)

  return m ? m[1] : null
}

export const resolveSkin = (name: string, colorMode: string): string => {
  const mode = colorMode === 'light' || colorMode === 'dark'
    ? colorMode
    : detectLightMode() ? 'light' : 'dark'

  return mode === 'light' ? `oh-${name}-light` : `oh-${name}`
}

interface PaletteRow {
  hint?: string
  label: string
  run: () => void
  value?: string
}

export interface OpencodePaletteProps {
  onCancel: () => void
  onNewSession: () => void
  onOpenConnectors: () => void
  onOpenModelPicker: () => void
  onOpenPluginsHub: () => void
  onOpenSessions: () => void
  onOpenSkillsHub: () => void
  t: Theme
}

export const OpencodePalette = memo(function OpencodePalette({
  onCancel,
  onNewSession,
  onOpenConnectors,
  onOpenModelPicker,
  onOpenPluginsHub,
  onOpenSessions,
  onOpenSkillsHub,
  t
}: OpencodePaletteProps) {
  const { rpc } = useGateway()
  const uiState = useStore($uiState)
  const uiLayout = uiState.layout
  const [view, setView] = useState<View>('commands')
  const [filter, setFilter] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  // openhermes: home-screen name draft for the `name` view (preview parity:
  // Enter confirms, Esc goes back). Null until loaded.
  const [nameDraft, setNameDraft] = useState<string | null>(null)
  // openhermes: skin active when the themes view opened — Esc reverts to it,
  // exactly like the preview (prevTheme).
  const entrySkinRef = useRef('')
  const [currentSkin, setCurrentSkin] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    if (view !== 'settings') {
      return
    }
    void (async () => {
      const out: Record<string, string> = {}

      for (const k of ['skin', 'reasoning', 'theme', 'agent_name']) {
        try {
          const r = (await rpc('config.get', { key: k })) as {
            display?: unknown
            value?: unknown
          } | null

          // `reasoning` reports {value: effort, display: show|hide}.
          out[k] = k === 'reasoning' ? String(r?.display ?? '') : String(r?.value ?? '')
        } catch {
          out[k] = ''
        }
      }

      setValues(out)
    })()
  }, [rpc, view])

  useEffect(() => {
    if (view !== 'themes') {
      return
    }
    void (async () => {
      try {
        const [s, m] = await Promise.all([
          rpc('config.get', { key: 'skin' }) as Promise<{ value?: unknown } | null>,
          rpc('config.get', { key: 'theme' }) as Promise<{ value?: unknown } | null>
        ])

        const skin = String(s?.value ?? '')
        setValues(prev => ({ ...prev, theme: String(m?.value ?? '') }))
        // Effective skin: the TUI override wins over the shared skin.
        // The entry override ('...' or '') is what Esc restores (preview parity).
        const effective = uiState.tuiSkinName || skin
        setCurrentSkin(effective)
        entrySkinRef.current = uiState.tuiSkinName
        const name = themeNameFromSkin(effective)
        setActiveIdx(name ? Math.max(0, THEME_NAMES.indexOf(name)) : 0)
      } catch {
        setCurrentSkin('')
      }
    })()
     
    // eslint-disable-next-line react-hooks/exhaustive-deps -- entry snapshot only
  }, [rpc, view])

  const setConfig = useCallback((key: string, value: string, local?: Record<string, string>) => {
    void (async () => {
      try {
        await rpc('config.set', { key, value })
        setErr('')

        if (local) {
          setValues(prev => ({ ...prev, ...local }))
        }
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e))
      }
    })()
  }, [rpc])

  const colorMode = values['theme'] || 'auto'
  const skinFor = (name: string) => resolveSkin(name, colorMode)

  // openhermes: themes apply to display.tui_skin (TUI-only) and resolve
  // instantly — display.skin (Hermes Desktop) is never touched.
  const applyTuiSkin = useCallback((skin: string) => {
    setCurrentSkin(skin)
    setConfig('tui_skin', skin)
    patchUiState({ tuiSkinName: skin })

    void (async () => {
      try {
        const r = (await rpc('skin.resolve_tui', {})) as GatewaySkin | null

        if (r && typeof r === 'object' && typeof r.name === 'string') {
          applySkin(r)
          setCurrentSkin(r.name || skin)
        }
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e))
      }
    })()
  }, [rpc, setConfig])

  const applyTheme = (name: string) => applyTuiSkin(skinFor(name))

  const cycleColorMode = () => {
    const next = COLOR_MODES[(COLOR_MODES.indexOf(colorMode) + 1) % COLOR_MODES.length] ?? 'auto'
    setConfig('theme', next, { theme: next })
    // Re-apply the current theme through the new mode (preview parity).
    const name = themeNameFromSkin(currentSkin)

    if (name) {
      applyTuiSkin(resolveSkin(name, next))
    }
  }

  // openhermes: entering the name view loads the saved name as the draft
  // (preview parity: empty when it is the default Hermes).
  useEffect(() => {
    if (view !== 'name') {
      return
    }
    void (async () => {
      try {
        const r = (await rpc('config.get', { key: 'agent_name' })) as { value?: unknown } | null
        const saved = String(r?.value ?? '')
        setNameDraft(saved && saved.toLowerCase() !== 'hermes' ? saved : '')
      } catch {
        setNameDraft('')
      }
    })()
  }, [rpc, view])

  const saveName = () => {
    const name = (nameDraft ?? '').trim().slice(0, 24)
    setConfig('agent_name', name)
    setValues(prev => ({ ...prev, agent_name: name }))
    // Instant repaint; the config poll confirms it right after.
    patchUiState({ agentName: name })
    onCancel()
  }

  const go = (v: View) => {
    setView(v)
    setFilter('')
    setActiveIdx(0)
  }

  const rows: { group: string; items: PaletteRow[] }[] = []

  if (view === 'commands') {
    rows.push(
      {
        group: 'Suggested',
        items: [
          { hint: 'ctrl+x l', label: 'Switch session', run: onOpenSessions },
          { hint: 'ctrl+x m', label: 'Switch model', run: onOpenModelPicker },
          { label: 'Open settings', run: () => go('settings') }
        ]
      },
      {
        group: 'Session',
        items: [
          { hint: 'ctrl+x l', label: 'Switch session', run: onOpenSessions },
          { hint: 'ctrl+x n', label: 'New session', run: onNewSession },
          { hint: 'ctrl+o', label: 'Open session or project', run: onOpenSessions }
        ]
      },
      {
        group: 'Tools',
        items: [
          { label: 'Skills', run: onOpenSkillsHub },
          { label: 'Plugins', run: onOpenPluginsHub },
          { label: 'Connect an integration', run: onOpenConnectors }
        ]
      },
      {
        group: 'Appearance',
        items: [
          { label: 'Switch theme', run: () => go('themes') },
          { label: 'Color mode', run: cycleColorMode },
          { label: 'Change name', run: () => go('name') }
        ]
      }
    )
  } else if (view === 'settings') {
    rows.push(
      {
        group: 'Appearance',
        items: [
          { label: 'Theme', run: () => go('themes'), value: uiState.tuiSkinName || values['skin'] || currentSkin },
          {
            label: 'Name',
            run: () => go('name'),
            value: values['agent_name'] || 'Hermes'
          },
          {
            label: 'Color mode',
            run: cycleColorMode,
            value: values['theme'] || 'auto'
          },
          {
            label: 'Layout',
            run: () => setConfig('layout', uiLayout === 'opencode' ? 'classic' : 'opencode'),
            value: uiLayout
          }
        ]
      },
      {
        group: 'Session',
        items: [
          { label: 'Model', run: onOpenModelPicker },
          {
            label: 'Reasoning',
            run: () => {
              const next = values['reasoning'] === 'hide' ? 'show' : 'hide'
              setConfig('reasoning', next, { reasoning: next })
            },
            value: values['reasoning'] === 'hide' ? 'off' : 'on'
          }
        ]
      }
    )
  } else {
    const q = filter.toLowerCase()
    rows.push({
      group: 'Themes',
      items: THEME_NAMES.filter(n => n.includes(q)).map(n => ({
        label: `${currentSkin === skinFor(n) ? '● ' : '  '}${n}`,
        // Hover already applied it live (preview parity) — Enter confirms.
        run: () => onCancel()
      }))
    })
  }

  const q = filter.toLowerCase()

  const visible =
    view === 'themes'
      ? rows
      : rows
          .map(g => ({
            ...g,
            items: g.items.filter(r => r.label.toLowerCase().includes(q))
          }))
          .filter(g => g.items.length > 0)

  const flat = visible.flatMap(g => g.items)
  const clamped = flat.length ? Math.min(activeIdx, flat.length - 1) : 0

  // openhermes: navigating the themes list previews live, exactly like the
  // preview (hover = apply, Enter = confirm, Esc = revert to entry skin).
  const previewSkin = (() => {
    if (view !== 'themes') {
      return null
    }

    const names = THEME_NAMES.filter(n => n.includes(filter.toLowerCase()))
    const name = names[Math.min(activeIdx, Math.max(0, names.length - 1))]

    return name ? skinFor(name) : null
  })()

  useEffect(() => {
    if (previewSkin && previewSkin !== currentSkin) {
      applyTuiSkin(previewSkin)
    }
  }, [applyTuiSkin, currentSkin, previewSkin, setConfig])

  useInput((ch, key) => {
    // openhermes: the name view owns every keystroke (preview parity:
    // type, Enter confirms, Esc goes back to settings).
    if (view === 'name') {
      if (key.return) {
        saveName()

        return
      }

      if (key.escape) {
        go('settings')

        return
      }

      if (key.backspace || key.delete) {
        setNameDraft(v => (v ?? '').slice(0, -1))

        return
      }

      if (key.upArrow || key.downArrow || key.leftArrow || key.rightArrow || key.tab) {
        return
      }

      if (ch && ch.length === 1 && !key.ctrl && !key.meta) {
        setNameDraft(v => ((v ?? '') + ch).slice(0, 24))
      }

      return
    }

    if (key.upArrow) {
      setActiveIdx(i => (i - 1 + flat.length) % Math.max(1, flat.length))

      return
    }

    if (key.downArrow) {
      setActiveIdx(i => (i + 1) % Math.max(1, flat.length))

      return
    }

    if (key.return) {
      flat[clamped]?.run()

      return
    }

    if (key.escape) {
      if (view === 'themes') {
        // Revert the hover preview to the entry override (preview parity).
        // An empty entry clears the override: the shared skin takes over.
        const entry = entrySkinRef.current

        if (entry !== currentSkin) {
          applyTuiSkin(entry)
        }

        go('commands')
      } else if (view !== 'commands') {
        go('commands')
      } else {
        onCancel()
      }

      return
    }

    if (key.backspace || key.delete) {
      setFilter(v => v.slice(0, -1))
      setActiveIdx(0)

      return
    }

    if (ch && ch.length === 1 && !key.ctrl && !key.meta) {
      setFilter(v => v + ch)
      setActiveIdx(0)
    }
  })

  let n = 0
  // openhermes: the 33-theme list windows around the selection so the
  // current theme is visible on open (the list always starts there).
  const THEME_WINDOW = 12

  const themeNames =
    view === 'themes' ? THEME_NAMES.filter(tn => tn.includes(filter.toLowerCase())) : []

  const themeOffset =
    view === 'themes' && themeNames.length
      ? windowOffset(themeNames.length, Math.min(activeIdx, themeNames.length - 1), THEME_WINDOW)
      : 0

  const title =
    view === 'commands' ? 'Commands' : view === 'settings' ? 'Settings' : view === 'name' ? 'Name' : 'Themes'

  return (
    <Box flexDirection="column" width={60}>
      <Box justifyContent="space-between">
        <Text bold color={t.color.text}>
          {title}
        </Text>
        <Text color={t.color.muted}>esc</Text>
      </Box>
      {view === 'name' ? (
        <>
          <Text bold color={t.color.accent}>
            Home screen name (Enter confirms)
          </Text>
          <Box borderColor={t.color.border} borderStyle="single" marginTop={1} paddingX={1}>
            {nameDraft ? (
              <Text color={t.color.text}>
                {nameDraft}
                <Text inverse> </Text>
              </Text>
            ) : (
              <Text color={t.color.muted}>
                Example: Jarvis
                <Text inverse> </Text>
              </Text>
            )}
          </Box>
        </>
      ) : (
        <>
          <Text color={t.color.muted}>{filter || 'Search'}</Text>
          {visible.map(g => (
        <Box flexDirection="column" key={g.group}>
          <Text bold color={t.color.accent}>
            {g.group}
          </Text>
          {g.items.map(r => {
            const idx = n
            n += 1

            if (view === 'themes' && (idx < themeOffset || idx >= themeOffset + THEME_WINDOW)) {
              return null
            }

            const selected = idx === clamped

            return (
              <Box
                backgroundColor={selected ? t.color.selectionBg : undefined}
                justifyContent="space-between"
                key={r.label}
              >
                <Text bold={selected} color={t.color.text}>
                  {r.label}
                </Text>
                <Text color={t.color.muted}>{r.value ?? r.hint ?? ''}</Text>
              </Box>
            )
          })}
        </Box>
      ))}
        </>
      )}
      {err ? <Text color={t.color.error}>{err}</Text> : null}
    </Box>
  )
})

export function openOpencodePalette() {
  patchOverlayState({ opencodePalette: true })
}
