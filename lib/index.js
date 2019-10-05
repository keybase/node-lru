"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var Item = /** @class */ (function () {
    function Item(key, value, size) {
        this.prev = undefined;
        this.next = undefined;
        this.added = Date.now();
        this.size = size || 1;
        this.key = key;
        this.value = value;
    }
    return Item;
}());
var ItemExported = /** @class */ (function () {
    function ItemExported(item) {
        this.key = item.key;
        this.value = item.value;
        this.added = item.added;
        this.size = item.size;
    }
    return ItemExported;
}());
var LRU = /** @class */ (function () {
    function LRU(opts) {
        if (isNaN(opts.maxStorage) || isNaN(opts.maxAgeMs)) {
            throw new Error('LRU must have an explicit maxStorage and maxAgeMs');
        }
        if (opts.maxStorage <= 0) {
            throw new Error('maxStorage must be > 0');
        }
        if (opts.maxAgeMs <= 0) {
            throw new Error('maxAgeMs must be > 0');
        }
        this.maxStorage = opts.maxStorage;
        this.maxAgeMs = opts.maxAgeMs;
        this.sizeFn = opts.sizeFn || (function (o) { return 1; });
        this.itemLookup = new Map();
        this.head = undefined;
        this.tail = undefined;
        this.usedStorage = 0;
    }
    LRU.prototype.has = function (k) {
        this.maybePurge();
        var e = this.itemLookup.get(k);
        if (e) {
            if (Date.now() - e.added > this.maxAgeMs) {
                this.remove(k);
                return false;
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }
    };
    LRU.prototype.put = function (k, v) {
        this.maybePurge();
        if (this.has(k)) {
            this.remove(k);
        }
        var item = new Item(k, v, this.sizeFn(v));
        this.itemLookup.set(k, item);
        if (this.tail) {
            this.tail.next = item;
            item.prev = this.tail;
        }
        else {
            this.head = item;
        }
        this.tail = item;
        this.usedStorage += item.size;
        this.maybePurge();
    };
    LRU.prototype.maybePurge = function () {
        var now = Date.now();
        while (this.usedStorage > this.maxStorage || (this.head && now - this.head.added > this.maxAgeMs)) {
            this.purgeHead();
        }
    };
    LRU.prototype.purgeHead = function () {
        var e = this.head;
        if (e) {
            this.usedStorage -= e.size;
            if (e.next) {
                this.head = e.next;
                this.head.prev = undefined;
            }
            else {
                this.head = undefined;
                this.tail = undefined;
            }
            e.next = undefined;
            e.prev = undefined;
            this.itemLookup.delete(e.key);
        }
    };
    LRU.prototype.get = function (k) {
        this.maybePurge();
        var item = this.itemLookup.get(k);
        if (!item) {
            return undefined;
        }
        else if (Date.now() - item.added > this.maxAgeMs) {
            this.remove(k);
            return undefined;
        }
        if (item === this.tail) {
            return item.value;
        }
        if (item.next) {
            if (item === this.head) {
                this.head = item.next;
            }
            item.next.prev = item.prev;
        }
        if (item.prev) {
            item.prev.next = item.next;
        }
        item.next = undefined;
        item.prev = this.tail;
        if (this.tail) {
            this.tail.next = item;
        }
        this.tail = item;
        return item.value;
    };
    LRU.prototype.remove = function (k) {
        var item = this.itemLookup.get(k);
        if (item) {
            this.usedStorage -= item.size;
            this.itemLookup.delete(k);
            if (item.next && item.prev) {
                // middle
                item.prev.next = item.next;
                item.next.prev = item.prev;
            }
            else if (item.next) {
                // at head, with children
                item.next.prev = undefined;
                this.head = item.next;
            }
            else if (item.prev) {
                // at tail, with parents
                item.prev.next = undefined;
                this.tail = item.prev;
            }
            else {
                // last remaining item
                this.head = undefined;
                this.tail = undefined;
            }
        }
        item.next = undefined;
        item.prev = undefined;
        return item.value;
    };
    LRU.prototype.logMe = function () {
        var str = '';
        var items = [];
        this.itemLookup.forEach(function (v, k) {
            items.push(k + "=" + v.value);
        });
        str += "I: " + items.join(', ') + "\n";
        var h = this.head;
        items = [];
        while (h) {
            items.push(h.key + "=" + h.value);
            h = h.next;
        }
        str += "H: " + items.join('->') + "\n";
        items = [];
        var t = this.tail;
        while (t) {
            items.push(t.key + "=" + t.value);
            t = t.prev;
        }
        str += "T: " + items.join('<-') + "\n";
        return str;
    };
    LRU.prototype.size = function () {
        return this.usedStorage;
    };
    LRU.prototype.toArray = function () {
        this.maybePurge();
        var res = [];
        var n = this.head;
        while (n) {
            res.push(new ItemExported(n));
            n = n.next;
        }
        return res;
    };
    return LRU;
}());
exports.default = LRU;
//# sourceMappingURL=index.js.map