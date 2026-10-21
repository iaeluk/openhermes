import { beforeEach, describe, expect, it, vi } from 'vitest'

import { isTermuxTuiMode } from '../lib/termux.js'

describe('isTermuxTuiMode', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })
  it('auto-detects Termux via TERMUX_VERSION', () => {
    expect(isTermuxTuiMode({ TERMUX_VERSION: '0.118.0' } as NodeJS.ProcessEnv)).toBe(true)
  })

  it('forces on inside proot distros where detection fails', () => {
    expect(isTermuxTuiMode({ HERMES_TUI_TERMUX_MODE: '1' } as NodeJS.ProcessEnv)).toBe(true)
  })

  it('forces off when explicitly disabled', () => {
    expect(
      isTermuxTuiMode({
        TERMUX_VERSION: '0.118.0',
        HERMES_TUI_TERMUX_MODE: '0'
      } as NodeJS.ProcessEnv)
    ).toBe(false)
  })

  it('stays off outside Termux with no override', () => {
    expect(isTermuxTuiMode({} as NodeJS.ProcessEnv)).toBe(false)
  })

  it('disables mouse tracking at boot when forced on (proot case)', async () => {
    vi.stubEnv('HERMES_TUI_TERMUX_MODE', '1')
    vi.stubEnv('TERMUX_VERSION', '')
    vi.stubEnv('PREFIX', '/usr')
    vi.resetModules()

    const env = await import('../config/env.js')

    expect(env.TERMUX_TUI_MODE).toBe(true)
    expect(env.MOUSE_TRACKING).toBe('off')
    vi.unstubAllEnvs()
    vi.resetModules()
  })
})
