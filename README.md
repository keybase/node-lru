# kb-node-lru
Simple JS LRU

```
npm install kb-node-lru
```

```coffeescript
LRU = require 'kb-node-lru'

cache1 = new LRU {max_age_ms: 10000, max_storage: 100}
cache2 = new LRU {max_age_ms: 10000, max_storage: 100, size_fn: (o) -> o.kilobytes_or_whatever() }
cache3 = new LRU {max_age_ms: 10000, max_storage: 100}

cache2.put 'foo', some_object
cache2.get 'foo'
cache2.has 'foo' # true
cache2.toArray()
```
