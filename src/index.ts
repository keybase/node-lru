//
// LRU with support for:
//    - max_storage:
//    - size_fn: optional, defaults to 1 for every item;
//           if you provide a size function, it can take 1 or 2 params;
//           we'll call fn(v,k)
//    - max_age_ms:
//
// This is implemented as a doubly-linked list, where head is oldest, tail is newest used
// Heavily modified by CRC from https://github.com/thomasf/lru-cache.git
// to support above-mentioned features
//
// ----------------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ItemValue = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SizeArg = any

interface ItemExported {
  key: string
  value: ItemValue
}

interface LruCreationArg {
  maxStorage: number
  maxAgeMs: number
  sizeFn?: SizeFn
}

class Item {
  key: string
  value: ItemValue
  prev?: Item
  next?: Item
  added: number
  size?: number
  constructor(key: string, value: ItemValue, size?: number) {
    this.prev = undefined
    this.next = undefined
    this.added = Date.now()
    this.key = key
    this.value = value
    if (size) {
      this.size = size
    }
  }
}
class ItemExported {
  key: string
  value: ItemValue
  added: number
  size: number
  constructor(item: Item) {
    this.key = item.key
    this.value = item.value
    this.added = item.added
    this.size = item.size || 1
  }
}

type SizeFn = (o: SizeArg) => number

class LRU {
  maxStorage: number
  maxAgeMs: number
  sizeFn?: SizeFn
  itemLookup: Map<string, Item>
  head?: Item
  tail?: Item
  usedStorage: number
  constructor(opts: LruCreationArg) {
    if (isNaN(opts.maxStorage) || isNaN(opts.maxAgeMs)) {
      throw new Error('LRU must have an explicit maxStorage and maxAgeMs')
    }
    if (opts.maxStorage <= 0) {
      throw new Error('maxStorage must be > 0')
    }
    if (opts.maxAgeMs <= 0) {
      throw new Error('maxAgeMs must be > 0')
    }
    this.maxStorage = opts.maxStorage
    this.maxAgeMs = opts.maxAgeMs
    this.sizeFn = opts.sizeFn
    this.itemLookup = new Map()
    this.head = undefined
    this.tail = undefined
    this.usedStorage = 0
  }
  public has(k: string): boolean {
    this.maybePurge()
    const e = this.itemLookup.get(k)
    if (e) {
      if (Date.now() - e.added > this.maxAgeMs) {
        this.remove(k)
        return false
      } else {
        return true
      }
    } else {
      return false
    }
  }

  public put(k: string, v: ItemValue): void {
    // maybePurge called by .has
    if (this.has(k)) {
      this.remove(k)
    }
    const item = this.sizeFn ? new Item(k, v, this.sizeFn(v)) : new Item(k, v)
    this.itemLookup.set(k, item)
    if (this.tail) {
      this.tail.next = item
      item.prev = this.tail
    } else {
      this.head = item
    }
    this.tail = item
    this.usedStorage += item.size || 1
  }

  private maybePurge(): void {
    const now = Date.now()
    while (this.usedStorage > this.maxStorage || (this.head && now - this.head.added > this.maxAgeMs)) {
      this.purgeHead()
    }
  }
  private purgeHead(): void {
    const item = this.head
    if (item) {
      this.usedStorage -= item.size || 1
      if (item.next) {
        this.head = item.next
        this.head.prev = undefined
      } else {
        this.head = undefined
        this.tail = undefined
      }
      item.next = undefined
      item.prev = undefined
      this.itemLookup.delete(item.key)
    }
  }

  public get(k: string): ItemValue {
    this.maybePurge()
    const item = this.itemLookup.get(k)
    if (!item) {
      return undefined
    } else if (Date.now() - item.added > this.maxAgeMs) {
      this.remove(k)
      return undefined
    }
    if (item === this.tail) {
      return item.value
    }
    if (item.next) {
      if (item === this.head) {
        this.head = item.next
      }
      item.next.prev = item.prev
    }
    if (item.prev) {
      item.prev.next = item.next
    }
    item.next = undefined
    item.prev = this.tail
    if (this.tail) {
      this.tail.next = item
    }
    this.tail = item
    return item.value
  }

  public remove(k: string): ItemValue {
    const item = this.itemLookup.get(k)
    if (item) {
      this.usedStorage -= item.size || 1
      this.itemLookup.delete(k)
      if (item.next && item.prev) {
        // middle
        item.prev.next = item.next
        item.next.prev = item.prev
      } else if (item.next) {
        // at head, with children
        item.next.prev = undefined
        this.head = item.next
      } else if (item.prev) {
        // at tail, with parents
        item.prev.next = undefined
        this.tail = item.prev
      } else {
        // last remaining item
        this.head = undefined
        this.tail = undefined
      }
    } else {
      return undefined
    }
    item.next = undefined
    item.prev = undefined
    return item.value
  }

  public logMe(): string {
    let str = ''
    let items: string[] = []
    this.itemLookup.forEach((v: ItemValue, k: string): void => {
      items.push(`${k}=${v.value}`)
    })
    str += `I: ${items.join(', ')}\n`
    let h = this.head
    items = []
    while (h) {
      items.push(`${h.key}=${h.value}`)
      h = h.next
    }
    str += `H: ${items.join('->')}\n`
    items = []
    let t = this.tail
    while (t) {
      items.push(`${t.key}=${t.value}`)
      t = t.prev
    }
    str += `T: ${items.join('<-')}\n`
    return str
  }

  public size(): number {
    return this.usedStorage
  }

  public toArray(): ItemExported[] {
    this.maybePurge()
    const res: ItemExported[] = []
    let n = this.head
    while (n) {
      res.push(new ItemExported(n))
      n = n.next
    }
    return res
  }
}

export = LRU
