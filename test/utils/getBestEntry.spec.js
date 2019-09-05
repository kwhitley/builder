// test files
import getBestEntry from '../../src/utils/getBestEntry.js'

describe('utils/getBestEntry(path)', () => {
  test('exports default function', () => {
    expect(typeof getBestEntry).toBe('function')
  })

  test('returns false if no appropriate file found', async () => {
    let entry = await getBestEntry(__dirname)

    expect(entry).toBe(false)
  })
})
