"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = __importDefault(require("./index"));
function timeout(time) {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, time);
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        function printUsage(stage, ms) {
            var heapUsedMb = process.memoryUsage().heapUsed / (1024 * 1024);
            var heapTotalMb = process.memoryUsage().heapTotal / (1024 * 1024);
            console.log(ms + "ms", "SIZE=" + lru.size(), stage, { heapUsedMb: heapUsedMb, heapTotalMb: heapTotalMb });
        }
        var INSERTS, lru, d, i, dt, i;
        return __generator(this, function (_a) {
            // A little script to test how much the LRU uses of memory
            if (!global.gc) {
                console.log('Run this test with --expose-gc');
                process.exit(1);
            }
            INSERTS = 5 * 1000 * 1000;
            lru = new index_1.default({ maxAgeMs: Infinity, maxStorage: Infinity });
            printUsage('startup', 0);
            d = Date.now();
            for (i = 0; i < INSERTS; i++) {
                lru.put("x" + i, true);
            }
            dt = Date.now() - d;
            global.gc();
            printUsage('inserts', dt);
            d = Date.now();
            for (i = 0; i < INSERTS; i++) {
                lru.remove("x" + i);
            }
            dt = Date.now() - d;
            global.gc();
            printUsage('removals', dt);
            return [2 /*return*/];
        });
    });
}
main();
//# sourceMappingURL=memory-explore-demo.js.map