import { describe, expect, it } from 'vitest'

import { renderPixelName } from '../components/pixelFont.js'

describe('renderPixelName', () => {
  it('renders 4 half-block rows for a caps name', () => {
    const rows = renderPixelName('MAYA')

    expect(rows).toHaveLength(4)
    expect(rows.join('')).toContain('█')
  })

  it('is deterministic and handles unknown glyphs', () => {
    expect(renderPixelName('MAYA')).toEqual(renderPixelName('MAYA'))
    expect(renderPixelName('A~')).toHaveLength(4)
  })
})
