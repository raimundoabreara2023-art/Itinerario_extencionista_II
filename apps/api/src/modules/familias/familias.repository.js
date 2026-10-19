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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.familiasRepository = familiasRepository;
var drizzle_orm_1 = require("drizzle-orm");
var schema_js_1 = require("../../db/schema.js");
function familiasRepository(db) {
    return {
        listarUnioes: function () { return db.select().from(schema_js_1.uniao); },
        buscarUniao: function (a, b) {
            return __awaiter(this, void 0, void 0, function () {
                var u;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, db
                                .select()
                                .from(schema_js_1.uniao)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.uniao.pessoaAId, a), (0, drizzle_orm_1.eq)(schema_js_1.uniao.pessoaBId, b)))];
                        case 1:
                            u = (_a.sent())[0];
                            return [2 /*return*/, u];
                    }
                });
            });
        },
        criarUniao: function (a, b) {
            return __awaiter(this, void 0, void 0, function () {
                var u;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, db.insert(schema_js_1.uniao).values({ pessoaAId: a, pessoaBId: b }).returning()];
                        case 1:
                            u = (_a.sent())[0];
                            return [2 /*return*/, u];
                    }
                });
            });
        },
        excluirUniao: function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var r;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, db.delete(schema_js_1.uniao).where((0, drizzle_orm_1.eq)(schema_js_1.uniao.id, id)).returning({ id: schema_js_1.uniao.id })];
                        case 1:
                            r = _a.sent();
                            return [2 /*return*/, r.length > 0];
                    }
                });
            });
        },
        listarFiliacoes: function () { return db.select().from(schema_js_1.filiacao); },
        buscarFiliacaoDoFilho: function (filhoId, papel) {
            return __awaiter(this, void 0, void 0, function () {
                var f;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, db
                                .select()
                                .from(schema_js_1.filiacao)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.filiacao.filhoId, filhoId), (0, drizzle_orm_1.eq)(schema_js_1.filiacao.papel, papel)))];
                        case 1:
                            f = (_a.sent())[0];
                            return [2 /*return*/, f];
                    }
                });
            });
        },
        criarFiliacao: function (filhoId, genitorId, papel) {
            return __awaiter(this, void 0, void 0, function () {
                var f;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, db.insert(schema_js_1.filiacao).values({ filhoId: filhoId, genitorId: genitorId, papel: papel }).returning()];
                        case 1:
                            f = (_a.sent())[0];
                            return [2 /*return*/, f];
                    }
                });
            });
        },
        excluirFiliacao: function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var r;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, db.delete(schema_js_1.filiacao).where((0, drizzle_orm_1.eq)(schema_js_1.filiacao.id, id)).returning({ id: schema_js_1.filiacao.id })];
                        case 1:
                            r = _a.sent();
                            return [2 /*return*/, r.length > 0];
                    }
                });
            });
        },
    };
}
