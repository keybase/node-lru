declare class Item {
  key: string
  value: any
  prev?: Item
  next?: Item
  added: number
  size: number
  constructor(key: string, value: any, size?: number)
}
declare class ItemExported {
  key: string
  value: any
  added: number
  size: number
  constructor(item: Item)
}
interface ItemExported {
  key: string
  value: any
}
interface LruCreationArg {
  maxStorage: number
  maxAgeMs: number
  sizeFn?: SizeFn
}
declare type SizeFn = (o: any) => number
declare class LRU {
  maxStorage: number
  maxAgeMs: number
  sizeFn: SizeFn
  itemLookup: Map<string, Item>
  head?: Item
  tail?: Item
  usedStorage: number
  constructor(opts: LruCreationArg)
  has(k: string): boolean
  put(k: string, v: any): void
  private maybePurge
  private purgeHead
  get(k: string): any
  remove(k: string): any
  logMe(): string
  size(): number
  toArray(): ItemExported[]
}
export = LRU
