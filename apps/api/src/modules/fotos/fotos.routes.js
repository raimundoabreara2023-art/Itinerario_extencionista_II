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
exports.fotosRoutes = fotosRoutes;
var node_fs_1 = require("node:fs");
var promises_1 = require("node:fs/promises");
var node_path_1 = require("node:path");
var promises_2 = require("node:stream/promises");
var erros_js_1 = require("../../shared/erros.js");
var pessoas_repository_js_1 = require("../pessoas/pessoas.repository.js");
var pessoas_schema_js_1 = require("../pessoas/pessoas.schema.js");
var EXTENSOES = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
};
function fotosRoutes(db, uploadDir) {
    var _this = this;
    var pessoas = (0, pessoas_repository_js_1.pessoasRepository)(db);
    var dirFotos = node_path_1.default.join(uploadDir, 'fotos');
    var apagarArquivo = function (relativo) {
        return relativo ? (0, promises_1.unlink)(node_path_1.default.join(uploadDir, relativo)).catch(function () { return undefined; }) : Promise.resolve();
    };
    return function (app) { return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            app.post('/pessoas/:id/foto', function (req) { return __awaiter(_this, void 0, void 0, function () {
                var id, pessoa, arquivo, ext, nome, destino;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            id = pessoas_schema_js_1.idParamSchema.parse(req.params).id;
                            return [4 /*yield*/, pessoas.buscar(id)];
                        case 1:
                            pessoa = _a.sent();
                            if (!pessoa)
                                throw (0, erros_js_1.naoEncontrado)('Pessoa');
                            return [4 /*yield*/, req.file()];
                        case 2:
                            arquivo = _a.sent();
                            if (!arquivo)
                                throw new erros_js_1.ErroNegocio('Envie uma imagem');
                            ext = EXTENSOES[arquivo.mimetype];
                            if (!ext) {
                                arquivo.file.resume();
                                throw new erros_js_1.ErroNegocio('Formato inválido: use JPG, PNG ou WebP');
                            }
                            return [4 /*yield*/, (0, promises_1.mkdir)(dirFotos, { recursive: true })];
                        case 3:
                            _a.sent();
                            nome = "".concat(id, "-").concat(Date.now()).concat(ext);
                            destino = node_path_1.default.join(dirFotos, nome);
                            return [4 /*yield*/, (0, promises_2.pipeline)(arquivo.file, (0, node_fs_1.createWriteStream)(destino))];
                        case 4:
                            _a.sent();
                            if (!arquivo.file.truncated) return [3 /*break*/, 6];
                            return [4 /*yield*/, (0, promises_1.unlink)(destino).catch(function () { return undefined; })];
                        case 5:
                            _a.sent();
                            throw new erros_js_1.ErroNegocio('Imagem maior que 5 MB');
                        case 6: return [4 /*yield*/, apagarArquivo(pessoa.foto)];
                        case 7:
                            _a.sent();
                            return [2 /*return*/, pessoas.definirFoto(id, "fotos/".concat(nome))];
                    }
                });
            }); });
            app.delete('/pessoas/:id/foto', function (req) { return __awaiter(_this, void 0, void 0, function () {
                var id, pessoa;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            id = pessoas_schema_js_1.idParamSchema.parse(req.params).id;
                            return [4 /*yield*/, pessoas.buscar(id)];
                        case 1:
                            pessoa = _a.sent();
                            if (!pessoa)
                                throw (0, erros_js_1.naoEncontrado)('Pessoa');
                            return [4 /*yield*/, apagarArquivo(pessoa.foto)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, pessoas.definirFoto(id, null)];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); };
}
