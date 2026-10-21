import { Box, Text } from '@hermes/ink'
import { compactNumber } from '@hermes/shared/format'
import type { Usage } from '@hermes/shared/gateway-events'
import { useStore } from '@nanostores/react'
import { memo, type ReactNode, useCallback, useEffect, useState } from 'react'

import { useGateway } from '../app/gatewayContext.js'
import { $uiSessionId } from '../app/uiStore.js'
import type { SessionActiveItem, SessionActiveListResponse } from '../gatewayTypes.js'
import type { Theme } from '../theme.js'
import type { SessionInfo } from '../types.js'

import { effortLabel } from './appChrome.js'
import { renderPixelName } from './pixelFont.js'

// openhermes Fase 2: opencode-style surfaces for the Ink TUI, rendered only
// when `display.layout` is "opencode". Classic look is untouched.

// Exact block logo from the approved preview.
const BLOCK_LOGO = [
  '█  █ █▀▀▀ █▀▀█ █▄ ▄█ █▀▀▀ █▀▀▀',
  '████ █▀▀  █▀▀▀ █ ▀█ █▀▀  ▀▀▀█',
  '█  █ ▀▀▀▀ ▀  ▀ ▀  ▀ ▀▀▀▀ ▀▀▀▀'
]

export const OpencodeIntro = memo(function OpencodeIntro({ name, t }: { name?: string; t: Theme }) {
  const custom = (name ?? '').trim()

  // Custom home-screen name (preview parity): anything but empty/"hermes"
  // renders big in crisp pixel letters instead of the block logo.
  if (custom && custom.toLowerCase() !== 'hermes') {
    const lines = renderPixelName(custom.toUpperCase().slice(0, 24))

    return (
      <Box alignItems="center" flexDirection="column" paddingY={1}>
        {lines.map((line, i) => (
          <Text color={t.color.text} key={i}>
            {line}
          </Text>
        ))}
      </Box>
    )
  }

  return (
    <Box alignItems="center" flexDirection="column" paddingY={2}>
      {BLOCK_LOGO.map((line, i) => (
        <Text color={t.color.text} key={i}>
          {line}
        </Text>
      ))}
    </Box>
  )
})

export const OpencodeBand = memo(function OpencodeBand({
  children,
  t
}: {
  children: ReactNode
  t: Theme
}) {
  return (
    <Box
      borderBottom={false}
      borderColor={t.color.accent}
      borderRight={false}
      borderStyle="bold"
      borderTop={false}
      flexDirection="column"
      marginBottom={1}
      paddingX={1}
      paddingY={1}
    >
      {children}
    </Box>
  )
})

export const OpencodeModelLine = memo(function OpencodeModelLine({
  agent,
  effort,
  effortWire,
  model,
  provider,
  t
}: {
  agent: string
  effort?: string
  effortWire?: string
  model: string
  provider?: string
  t: Theme
}) {
  if (!model) {
    return null
  }

  const where = [model, provider].filter(Boolean).join(' ')
  // Same token as the classic status bar: hidden when default/medium.
  const how = effortLabel(effort, effortWire)

  return (
    <Box>
      <Text color={t.color.muted} wrap="truncate-end">
        <Text bold color={t.color.accent}>
          {agent}
        </Text>
        {` · ${where}`}
        {how ? ` · ${how}` : ''}
      </Text>
    </Box>
  )
})

// Hints row under the composer, exactly like the preview:
// `~` on the left, shortcuts on the right.
export const OpencodeHints = memo(function OpencodeHints({ t }: { t: Theme }) {
  return (
    <Box flexDirection="row" justifyContent="space-between" marginTop={1} paddingX={1}>
      <Text color={t.color.muted}>~</Text>
      <Text color={t.color.muted} wrap="truncate-end">
        <Text color={t.color.text}>shift+tab</Text>
        {' agents  '}
        <Text color={t.color.text}>ctrl+p</Text>
        {' commands'}
      </Text>
    </Box>
  )
})

const countEntries = (rec?: Record<string, string[]> | null): number =>
  rec ? Object.values(rec).reduce((n, arr) => n + (arr?.length ?? 0), 0) : 0

export const OpencodeStatusBar = memo(function OpencodeStatusBar({
  fresh,
  info,
  t,
  usage
}: {
  fresh: boolean
  info?: SessionInfo | null
  t: Theme
  usage?: Usage | null
}) {
  if (fresh) {
    const tools = countEntries(info?.tools)
    const skills = countEntries(info?.skills)

    return (
      <Box flexDirection="row" justifyContent="space-between" paddingX={1}>
        <Text color={t.color.muted} wrap="truncate-end">
          {`⊙ ${tools} tools · ${skills} skills`}
        </Text>
        <Text color={t.color.muted}>{info?.version ?? ''}</Text>
      </Box>
    )
  }

  const used = usage?.context_used ?? 0
  const pct = usage?.context_percent ?? 0

  const cost = usage?.cost_usd ?? (typeof usage?.dev_credits_spent_micros === 'number'
    ? usage.dev_credits_spent_micros / 1_000_000
    : 0)

  return (
    <Box flexDirection="row" justifyContent="space-between" paddingX={1}>
      <Text color={t.color.muted} wrap="truncate-end">
        {`${compactNumber(used)} (${Math.round(pct)}%) · $${cost.toFixed(2)}`}
      </Text>
      <Text color={t.color.muted}>
        <Text bold color={t.color.text}>ctrl+p</Text>
        {' commands'}
      </Text>
    </Box>
  )
})

// Per-answer meta line, like the preview:
// `AGENT · model · 1.8s · 42.5 tok/s` (session averages, same numbers as status).
export const OpencodeMeta = memo(function OpencodeMeta({
  agent,
  model,
  t,
  usage
}: {
  agent: string
  model: string
  t: Theme
  usage?: Usage | null
}) {
  const parts = [agent, model]

  if (typeof usage?.avg_latency_s === 'number') {
    parts.push(`${usage.avg_latency_s.toFixed(1)}s`)
  }

  if (typeof usage?.avg_tps === 'number') {
    parts.push(`${usage.avg_tps.toFixed(1)} tok/s`)
  }

  if (parts.length <= 2) {
    return null
  }

  return (
    <Box paddingX={1}>
      <Text color={t.color.muted} wrap="truncate-end">
        {parts.join(' · ')}
      </Text>
    </Box>
  )
})

const TAB_TITLE_LEN = 24
const TABS_POLL_MS = 6000

export interface OpencodeTabsProps {
  fresh: boolean
  onClose: (id: string) => void
  onNew: () => void
  onSelect: (id: string) => void
  t: Theme
}

export const OpencodeTabs = memo(function OpencodeTabs({ fresh, onClose, onNew, onSelect, t }: OpencodeTabsProps) {
  const { gw } = useGateway()
  const sid = useStore($uiSessionId)
  const [tabs, setTabs] = useState<SessionActiveItem[]>([])

  const refresh = useCallback(() => {
    void (async () => {
      try {
        const r = await gw.request<SessionActiveListResponse>('session.active_list', {})
        const rows = (r as SessionActiveListResponse | null)?.sessions

        if (rows) {
          setTabs(rows)
        }
      } catch {
        // Keep last-good list; a transient failure must not blank the bar.
      }
    })()
  }, [gw])

  useEffect(() => {
    refresh()
  }, [refresh, sid])

  useEffect(() => {
    const id = setInterval(refresh, TABS_POLL_MS)

    return () => clearInterval(id)
  }, [refresh])

  // openhermes: close mirrors ActiveSessionSwitcher — refresh now, and when
  // the current session died adopt a fallback (another live tab, else a new
  // session) so the TUI never sits on a dead session.
  const handleClose = useCallback((id: string) => {
    void (async () => {
      try {
        await onClose(id)
      } catch {
        // A failed close just leaves the tab; the refresh below repairs it.
      }

      try {
        const list = await gw.request<SessionActiveListResponse>('session.active_list', {})
        const rows = list?.sessions ?? []
        setTabs(rows)

        if (sid != null && id === sid) {
          const next = rows.find(t => t.id !== id) ?? rows[0]

          if (next) {
            onSelect(next.id)
          } else {
            onNew()
          }
        }
      } catch {
        // Keep last-good list; the poll retries.
      }
    })()
  }, [gw, onClose, onNew, onSelect, sid])

  if (tabs.length <= 1 && fresh) {
    return null
  }

  return (
    <Box flexDirection="row" paddingX={1}>
      {tabs.map(tab => {
        const active = tab.current || (sid != null && tab.id === sid)
        const title = (tab.title || tab.preview || tab.id).slice(0, TAB_TITLE_LEN)

        return (
          <Box flexDirection="row" key={tab.id}>
            <Box onClick={() => onSelect(tab.id)}>
              <Text
                backgroundColor={active ? t.color.statusBg : undefined}
                bold={active}
                color={active ? t.color.text : t.color.muted}
              >
                {` ${title} `}
              </Text>
            </Box>
            <Box onClick={() => handleClose(tab.id)}>
              <Text color={t.color.muted}>{' ×'}</Text>
            </Box>
          </Box>
        )
      })}
      {!fresh && (
        <Box onClick={() => onNew()}>
          <Text color={t.color.muted}>{' + New session'}</Text>
        </Box>
      )}
    </Box>
  )
})
