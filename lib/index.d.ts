declare type ItemValue = any
declare type SizeArg = any
interface ItemExported {
  key: string
  value: ItemValue
}
interface LruCreationArg {
  maxStorage: number
  maxAgeMs: number
  sizeFn?: SizeFn
}
declare class Item {
  key: string
  value: ItemValue
  prev?: Item
  next?: Item
  added: number
  size?: number
  constructor(key: string, value: ItemValue, size?: number)
}
declare class ItemExported {
  key: string
  value: ItemValue
  added: number
  size: number
  constructor(item: Item)
}
declare type SizeFn = (o: SizeArg) => number
declare class LRU {
  maxStorage: number
  maxAgeMs: number
  sizeFn?: SizeFn
  itemLookup: Map<string, Item>
  head?: Item
  tail?: Item
  usedStorage: number
  constructor(opts: LruCreationArg)
  size(): number
  has(k: string): boolean
  put(k: string, v: ItemValue): void
  private maybePurge
  private purgeHead
  get(k: string): ItemValue
  remove(k: string): ItemValue
  logMe(): string
  toArray(): ItemExported[]
}
export = LRU
