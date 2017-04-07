LRU      = require '../../index.js'

# -------------------------------------------------------------------------
# Starting in v2.0.0, constructor insists on both max_age_ms and max_storage
#  to prevent user error of passing one of them with a typo and inferring
#  Infinity. (Infinity must be explicitly requested now.)
# -------------------------------------------------------------------------

exports.missing_options = (T, cb) ->
  try
    lru = new LRU()
    lru.put "this", "that"
    caught = false
  catch e
    caught = true
  T.assert caught, "recognized missing options"
  cb()

# -------------------------------------------------------------------------

exports.missing_max_age_ms = (T, cb) ->
  try
    # note it's supposed to be max_age_ms, not max_age
    lru = new LRU {max_age: 34, max_storage: 10}
    lru.put "this", "that"
    caught = false
  catch e
    caught = true
  T.assert caught, "recognized missing max_age_ms param"
  cb()

# -------------------------------------------------------------------------

exports.missing_max_storage = (T, cb) ->
  try
    # note it's supposed to be max_storage, not max_store
    lru = new LRU {max_age_ms: 34, max_store: 10}
    lru.put "this", "that"
    caught = false
  catch e
    caught = true
  T.assert caught, "recognized missing max_storage param"
  cb()

# -------------------------------------------------------------------------

exports.infinities_ok = (T, cb) ->
  lru = new LRU {max_age_ms: Infinity, max_storage: Infinity}
  lru.put "this", "that"
  T.assert (lru.get('this') is 'that')
  cb()

# -------------------------------------------------------------------------

exports.zero_storage_not_ok = (T, cb) ->
  try
    lru = new LRU {max_age_ms: 34, max_storage: 0}
    lru.put "this", "that"
    caught = false
  catch e
    caught = true
  T.assert caught, "recognized zero storage not ok"
  cb()

# -------------------------------------------------------------------------

exports.zero_age_not_ok = (T, cb) ->
  try
    lru = new LRU {max_age_ms: 0, max_storage: 100}
    lru.put "this", "that"
    caught = false
  catch e
    caught = true
  T.assert caught, "recognized zero age not ok"
  cb()
