# kb-node-lru

Simple JS LRU Cache, v3.0.0+ now written in TypeScript.

```
npm install kb-node-lru
```

```javascript
import LRU from 'kb-node-lru'

const cache1 = new LRU({maxAgeMs: 10000, maxStorage: 100})
const cache2 = new LRU({
  maxAgeMs: 10000,
  maxStorage: 100,
  sizeFn: o => {
    o.kilobytes_or_whatever()
  },
})
const cache3 = new LRU({maxAgeMs: Infinity, maxStorage: Infinity})

cache2.put('foo', someObject)
cache2.get('foo') // someObject
cache2.has('foo') // true
cache2.remove('foo') // removes it
cache2.toArray() // an array of objects with keys and access times
cache2.logMe() // returns big string for debugging
```

### Contributing

- run `yarn modules` to install necessary dev modules
- run `yarn dev --watch` to watch typescript and compile while working
- run `yarn test` to make sure it passes all tests
- run `yarn memtest` to watch how much memory it uses with repeated large LRU creation/removals
