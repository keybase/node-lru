import LRU from './index'

async function main(): Promise<void> {
  // A little script to test how much the LRU uses of memory
  if (!global.gc) {
    console.log('Run this test with --expose-gc')
    process.exit(1)
  }
  const INSERTS = 1000 * 1000
  const STORAGE = 1000 * 1000
  const lru = new LRU({maxAgeMs: Infinity, maxStorage: STORAGE})
  function printUsage(stage: string, ms: number, ops: number): void {
    const perItem = process.memoryUsage().heapUsed / lru.size()
    const heapUsedMb = process.memoryUsage().heapUsed / (1024 * 1024)
    const heapTotalMb = process.memoryUsage().heapTotal / (1024 * 1024)
    const opsPerMs = ops / ms
    console.log(`${ms}ms`, `SIZE=${lru.size()} per item=${perItem.toFixed(1)} bytes ops/ms=${opsPerMs.toFixed(0)}`, stage, {
      heapUsedMb,
      heapTotalMb,
    })
  }
  printUsage('startup', 0, 0)

  async function addTest(): Promise<void> {
    const d = Date.now()
    for (let i = 0; i < INSERTS; i++) {
      const v = i.toString(36)
      lru.put(v, v)
    }
    const dt = Date.now() - d
    global.gc()
    printUsage('inserts', dt, INSERTS)
  }
  async function removeTest(): Promise<void> {
    const d = Date.now()
    for (let i = 0; i < INSERTS; i++) {
      lru.remove(i.toString(36))
    }
    const dt = Date.now() - d
    global.gc()
    printUsage('removals', dt, INSERTS)
  }
  async function lookupTest(): Promise<void> {
    const d = Date.now()
    for (let i = 0; i < INSERTS; i++) {
      lru.get(i.toString(36))
    }
    const dt = Date.now() - d
    global.gc()
    printUsage('lookups', dt, INSERTS)
  }
  while (true) {
    await addTest()
    await lookupTest()
    await removeTest()
  }
}
main()
