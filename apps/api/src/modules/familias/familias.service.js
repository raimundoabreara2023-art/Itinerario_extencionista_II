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
exports.familiasService = familiasService;
var domain_1 = require("@raizes/domain");
var erros_js_1 = require("../../shared/erros.js");
function familiasService(repo, pessoas) {
    var _this = this;
    var exigirPessoa = function (id) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pessoas.buscar(id)];
                case 1:
                    if (!(_a.sent()))
                        throw (0, erros_js_1.naoEncontrado)("Pessoa ".concat(id));
                    return [2 /*return*/];
            }
        });
    }); };
    return {
        listarUnioes: function () { return repo.listarUnioes(); },
        listarFiliacoes: function () { return repo.listarFiliacoes(); },
        criarUniao: function (_a) {
            return __awaiter(this, arguments, void 0, function (_b) {
                var a, b;
                var pessoaAId = _b.pessoaAId, pessoaBId = _b.pessoaBId;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (pessoaAId === pessoaBId)
                                throw new erros_js_1.ErroNegocio('Uma pessoa não pode se unir a ela mesma');
                            return [4 /*yield*/, exigirPessoa(pessoaAId)];
                        case 1:
                            _c.sent();
                            return [4 /*yield*/, exigirPessoa(pessoaBId)];
                        case 2:
                            _c.sent();
                            a = Math.min(pessoaAId, pessoaBId);
                            b = Math.max(pessoaAId, pessoaBId);
                            return [4 /*yield*/, repo.buscarUniao(a, b)];
                        case 3:
                            if (_c.sent())
                                throw new erros_js_1.ErroNegocio('Esse casal já está cadastrado', 409);
                            return [2 /*return*/, repo.criarUniao(a, b)];
                    }
                });
            });
        },
        excluirUniao: function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, repo.excluirUniao(id)];
                        case 1:
                            if (!(_a.sent()))
                                throw (0, erros_js_1.naoEncontrado)('União');
                            return [2 /*return*/];
                    }
                });
            });
        },
        criarFiliacao: function (_a) {
            return __awaiter(this, arguments, void 0, function (_b) {
                var todas;
                var filhoId = _b.filhoId, genitorId = _b.genitorId, papel = _b.papel;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (filhoId === genitorId)
                                throw new erros_js_1.ErroNegocio('Ninguém pode ser pai/mãe de si mesmo');
                            return [4 /*yield*/, exigirPessoa(filhoId)];
                        case 1:
                            _c.sent();
                            return [4 /*yield*/, exigirPessoa(genitorId)];
                        case 2:
                            _c.sent();
                            return [4 /*yield*/, repo.buscarFiliacaoDoFilho(filhoId, papel)];
                        case 3:
                            if (_c.sent()) {
                                throw new erros_js_1.ErroNegocio("Essa pessoa j\u00E1 tem ".concat(papel === 'PAI' ? 'um pai' : 'uma mãe', " cadastrado(a)"), 409);
                            }
                            return [4 /*yield*/, repo.listarFiliacoes()];
                        case 4:
                            todas = _c.sent();
                            // o "filho" não pode ser ancestral do genitor (evita ciclos na árvore)
                            if ((0, domain_1.ehAncestral)(todas, filhoId, genitorId)) {
                                throw new erros_js_1.ErroNegocio('Isso criaria um ciclo: o filho já é ancestral dessa pessoa');
                            }
                            return [2 /*return*/, repo.criarFiliacao(filhoId, genitorId, papel)];
                    }
                });
            });
        },
        excluirFiliacao: function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, repo.excluirFiliacao(id)];
                        case 1:
                            if (!(_a.sent()))
                                throw (0, erros_js_1.naoEncontrado)('Filiação');
                            return [2 /*return*/];
                    }
                });
            });
        },
    };
}
