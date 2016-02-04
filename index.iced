#
# LRU with support for:
#    - max_storage:
#    - size_fn: optional, defaults to 1 for every item;
#           if you provide a size function, it can take 1 or 2 params;
#           we'll call fn(v,k)
#    - max_age_ms:
#
# This is implemented as a doubly-linked list, where head is oldest, tail is newest used
# Heavily modified by CRC from https://github.com/thomasf/lru-cache.git
# to support above-mentioned features
#
# ----------------------------------------------------------------------------------

class Item
  constructor: (@k, @v, @s) ->
    @p = @n = undefined
    @a = Date.now()
    # k = key, v = val, s = size, a = added, p = prev, n = next

class LRU
  constructor: (options) ->
    {max_storage, max_age_ms, size_fn} = options or {}
    @max_storage  = max_storage or Infinity
    @max_age_ms   = max_age_ms  or Infinity
    @size_fn      = size_fn     or -> 1

    @item_lookup = {}
    @head = @tail = undefined
    @used_storage = 0

  log_me: ->
    ###
    Useful just for running some tests/debugging/hunting for mem leaks
    ###
    items = []
    for k,v of @item_lookup
      items.push "#{k}=#{v.v}"
    console.log "I: " + items.join ", "
    h = @head
    items = []
    while h?
      items.push "#{h.k}=#{h.v}"
      h = h.n
    console.log "H: " + items.join "->"
    items = []
    t = @tail
    while t
      items.push "#{t.k}=#{t.v}"
      t = t.p
    console.log "T: " + items.join "<-"

  put: (k, v) ->
    @maybePurge()
    @remove k if @has k
    e = new Item k, v, (@size_fn v, k)
    @item_lookup[k] = e
    if @tail
      @tail.n = e
      e.p = @tail
    else
      @head = e
    @tail = e
    @used_storage += e.s
    @maybePurge()
    @

  maybePurge: ->
    now = Date.now()
    while (@used_storage > @max_storage) or (@used_storage > 0 and (now - @head.a > @max_age_ms))
      @purgeHead()

  purgeHead: ->
    e = @head
    if e
      @used_storage -= e.s
      if @head.n?
        @head = @head.n
        @head.p = undefined
      else
        @head = undefined
        @tail = undefined
      e.n = e.p = undefined
      delete @item_lookup[e.k]
    e

  get: (k) ->
    @maybePurge()
    e = @item_lookup[k]
    if not e?
      return undefined
    else if Date.now() - e.a > @max_age_ms
      @remove k
      return undefined
    if e is @tail
      return e.v
    if e.n
      if e is @head
        @head = e.n
      e.n.p = e.p
    if e.p
      e.p.n = e.n
    e.n = undefined
    e.p = @tail
    @tail.n = e if @tail
    @tail = e
    e.v

  remove: (k) ->
    e = @item_lookup[k]
    return undefined unless e?
    @used_storage -= e.s
    delete @item_lookup[e.k]
    if e.n? and e.p? # middle
      e.p.n = e.n
      e.n.p = e.p
    else if e.n?     # at head and has any children
      e.n.p = undefined
      @head = e.n
    else if e.p?     # at tail and has any parents
      e.p.n = undefined
      @tail = e.p
    else             # last remaining item
      @head = undefined
      @tail = undefined
    e.v

  has: (k) ->
    @maybePurge()
    e = @item_lookup[k]
    if not e?
      return false
    else if Date.now() - e.a > @max_age_ms
      @remove k
      return false
    else
      return true

  toArray: ->
    @maybePurge()
    res = []
    n = @head
    while n?
      res.push {
        k: n.k
        v: n.v
        a: n.a
        s: n.s
      }
      n = n.n
    res

  size: -> @used_storage

# =========

module.exports = LRU
