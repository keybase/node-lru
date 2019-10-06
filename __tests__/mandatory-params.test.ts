import LRU from '../lib'

function timeout(time: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

describe('mandatory param tests', () => {
  it('will accept good params', () => {
    let caught = false
    try {
      // @ts-ignore
      const lru = new LRU({maxStorage: 10, maxAgeMs: 10})
      lru.put('foo', 'bar')
    } catch (e) {
      caught = true
    }
    expect(caught).toBe(false)
  })

  it('will not accept no params', () => {
    let caught = false
    try {
      // @ts-ignore
      const lru = new LRU()
      lru.put('foo', 'bar')
    } catch (e) {
      caught = true
    }
    expect(caught).toBe(true)
  })

  it('will see misspelling of maxStorage', () => {
    let caught = false
    try {
      // @ts-ignore
      const lru = new LRU({maxAgeMs: 10, maxStorge: 10})
      lru.put('foo', 'bar')
    } catch (e) {
      caught = true
    }
    expect(caught).toBe(true)
  })

  it('will see misspelling of maxAgeMs', () => {
    let caught = false
    try {
      // @ts-ignore
      const lru = new LRU({maxAgeMsec: 10, maxStorage: 10})
      lru.put('foo', 'bar')
    } catch (e) {
      caught = true
    }
    expect(caught).toBe(true)
  })

  it('can handle Infinity', async (): Promise<void> => {
    const lru = new LRU({maxAgeMs: Infinity, maxStorage: Infinity})
    lru.put('dog', 'rover')
    lru.put('man', 'the dude')
    await timeout(50)
    expect(lru.get('dog')).toBe('rover')
    expect(lru.get('man')).toBe('the dude')
  })

  it('rejects maxStorage 0', () => {
    let caught = false
    try {
      // @ts-ignore
      const lru = new LRU({maxAgeMs: 10, maxStorage: 0})
      lru.put('foo', 'bar')
    } catch (e) {
      caught = true
    }
    expect(caught).toBe(true)
  })
  it('rejects maxAgeMs 0', () => {
    let caught = false
    try {
      // @ts-ignore
      const lru = new LRU({maxAgeMs: 0, maxStorage: 10})
      lru.put('foo', 'bar')
    } catch (e) {
      caught = true
    }
    expect(caught).toBe(true)
  })
})
