import { describe, expect, it } from 'vitest'

import { resolveSkin, themeNameFromSkin } from '../components/opencodePalette.js'

describe('themeNameFromSkin', () => {
  it('strips the oh- prefix and -light suffix', () => {
    expect(themeNameFromSkin('oh-dracula')).toBe('dracula')
    expect(themeNameFromSkin('oh-dracula-light')).toBe('dracula')
    expect(themeNameFromSkin('oh-cobalt2')).toBe('cobalt2')
  })

  it('returns null for non-openhermes skins', () => {
    expect(themeNameFromSkin('omarchy')).toBe(null)
    expect(themeNameFromSkin('default')).toBe(null)
    expect(themeNameFromSkin('')).toBe(null)
  })
})

describe('resolveSkin', () => {
  it('honors an explicit light/dark color mode', () => {
    expect(resolveSkin('dracula', 'light')).toBe('oh-dracula-light')
    expect(resolveSkin('dracula', 'dark')).toBe('oh-dracula')
  })

  it('resolves auto through terminal detection (boolean either way)', () => {
    expect(['oh-dracula', 'oh-dracula-light']).toContain(resolveSkin('dracula', 'auto'))
    expect(['oh-nord', 'oh-nord-light']).toContain(resolveSkin('nord', ''))
  })
})
