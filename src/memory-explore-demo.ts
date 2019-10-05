import LRU from './index'

function timeout(time: number): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

async function main(): Promise<void> {
  // A little script to test how much the LRU uses of memory
  if (!global.gc) {
    console.log('Run this test with --expose-gc')
    process.exit(1)
  }
  const INSERTS = 1 * 1000 * 1000
  const lru = new LRU({maxAgeMs: Infinity, maxStorage: Infinity})

  function printUsage(stage: string, ms: number): void {
    const heapUsedMb = process.memoryUsage().heapUsed / (1024 * 1024)
    const heapTotalMb = process.memoryUsage().heapTotal / (1024 * 1024)
    console.log(`${ms}ms`, `SIZE=${lru.size()}`, stage, {heapUsedMb, heapTotalMb})
  }

  printUsage('startup', 0)

  let d = Date.now()
  for (let i = 0; i < INSERTS; i++) {
    lru.put(`x${i}`, `y${i}`)
  }
  let dt = Date.now() - d
  global.gc()
  printUsage('inserts', dt)

  d = Date.now()
  for (let i = 0; i < INSERTS; i++) {
    lru.remove(`x${i}`)
  }
  dt = Date.now() - d
  global.gc()
  printUsage('removals', dt)
}
main()
