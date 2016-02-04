LRU  = require '../../index.js'

OBJ =
  cat: {name: 'fluffy', weight: 10}
  dog: {name: 'spot',   weight: 20}
  man: {name: 'trump',  weight: 30}
  bob: {name: 'bob',    weight: 40, age: 54}

exports.max_storage = (T, cb) ->
  lru = new LRU {max_age_ms: 1000, max_storage: 3}
  for k,v of OBJ
    lru.put k, v
    T.equal v, lru.get(k)
  T.assert lru.toArray().length is 3
  T.assert (not lru.get 'cat'),               'cat be gone'
  cb()

exports.double_put = (T, cb) ->
  lru = new LRU {max_age_ms: 1000, max_storage: 3}
  lru.put 'dog', OBJ.cat                   # let's write a bad one
  lru.put 'dog', OBJ.dog                   # and replace
  T.assert (lru.toArray().length is 1),       'no double write'
  T.assert (lru.get('dog') is OBJ.dog),    'dog be dog'
  T.assert (lru.get('dog') isnt OBJ.cat),  'dog not be cat'
  cb()

exports.expiration = (T,cb) ->
  lru = new LRU {max_age_ms: 100, max_storage: 3}
  lru.put 'dog', OBJ.dog
  lru.put 'man', OBJ.man
  await setTimeout defer(), 50
  T.assert (lru.get('dog') is OBJ.dog),    'still has dog'
  T.assert (lru.get('man') is OBJ.man),    'still has man'
  lru.put 'cat', OBJ.cat
  lru.put 'man', OBJ.man
  await setTimeout defer(), 75
  T.assert (not lru.has 'dog'),               'does not have dog'
  T.assert (lru.has 'cat'),                   'still has cat'
  T.assert (lru.has 'man'),                   'still has man, 2'
  T.assert (lru.toArray().length is 2),       'array length shrunk'
  await setTimeout defer(), 110
  T.assert lru.toArray().length is 0
  T.assert (not lru.has 'man')
  T.assert (not lru.has 'cat')
  T.assert (not lru.has 'dog')
  cb()

exports.dynamic_storage = (T, cb) ->
  lru = new LRU {max_age_ms: Infinity, max_storage: 70, size_fn: (o) -> return o.weight}
  for k,v of OBJ
    lru.put k, v
    T.equal v, lru.get(k)
  T.assert lru.toArray().length is 2
  T.assert (not lru.get 'cat'),               'cat be gone'
  T.assert (not lru.get 'dog'),               'dog be gone'
  T.assert (lru.get 'man'),                   'man stuck around'
  T.assert (lru.get 'bob'),                   'bob stuck around'
  cb()
