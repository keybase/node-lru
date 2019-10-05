import LRU from '../lib'

function timeout(time: number): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const obj: any = {
  cat: {name: 'fluffy', weight: 10},
  dog: {name: 'spot', weight: 20},
  man: {name: 'trump', weight: 30},
  bob: {name: 'bob', weight: 40, age: 54},
}

describe('basic tests', () => {
  it('can kick things out due to max storage', () => {
    const lru = new LRU({maxAgeMs: 1000, maxStorage: 3})
    for (const [k, v] of Object.entries(obj)) {
      lru.put(k, v)
      expect(lru.get(k)).toBe(v)
    }
    expect(lru.toArray().length).toBe(3)
    expect(lru.get('cat')).toBe(undefined)
    expect(lru.get('dog')).toBe(obj.dog)
  })
  it('can handle double puts', () => {
    const lru = new LRU({maxAgeMs: 1000, maxStorage: 3})
    lru.put('dog', obj.cat)
    lru.put('dog', obj.dog)
    expect(lru.toArray().length).toBe(1)
    expect(lru.get('dog')).toBe(obj.dog)
    expect(lru.get('dog')).not.toBe(obj.cat)
  })
  it('can handle expirations', async (): Promise<void> => {
    const lru = new LRU({maxAgeMs: 100, maxStorage: 3})
    lru.put('dog', obj.dog)
    lru.put('man', obj.man)
    await timeout(50)
    expect(lru.get('dog')).toBe(obj.dog)
    expect(lru.get('man')).toBe(obj.man)
    lru.put('cat', obj.cat)
    lru.put('man', obj.man)
    await timeout(75)
    expect(lru.has('dog')).toBe(false)
    expect(lru.has('cat')).toBe(true)
    expect(lru.has('man')).toBe(true)
    expect(lru.toArray().length).toBe(2)
    await timeout(110)
    expect(lru.toArray().length).toBe(0)
    expect(lru.has('man')).toBe(false)
    expect(lru.has('cat')).toBe(false)
    expect(lru.has('dog')).toBe(false)
  })
  it('can accept and use a size function', () => {
    const lru = new LRU({maxAgeMs: Infinity, maxStorage: 70, sizeFn: o => o.weight})
    for (const [k, v] of Object.entries(obj)) {
      lru.put(k, v)
      expect(lru.get(k)).toBe(v)
    }
    expect(lru.toArray().length).toBe(2)
    expect(lru.get('cat')).toBe(undefined)
    expect(lru.get('dog')).toBe(undefined)
    expect(lru.get('man')).toBe(obj.man)
    expect(lru.get('bob')).toBe(obj.bob)
  })
  it('can print its shape', () => {
    const lru = new LRU({maxAgeMs: 100, maxStorage: 3})
    for (const [k, v] of Object.entries(obj)) {
      lru.put(k, v)
      expect(lru.get(k)).toBe(v)
    }
    const logMe = lru.logMe().replace(/\s/g, '')
    const expected = `
    I: dog=[object Object], man=[object Object], bob=[object Object]
    H: dog=[object Object]->man=[object Object]->bob=[object Object]
    T: bob=[object Object]<-man=[object Object]<-dog=[object Object]`.replace(/\s/g, '')
    expect(logMe).toBe(expected)
  })
})
