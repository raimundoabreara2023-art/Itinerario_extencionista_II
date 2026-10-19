"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
exports.createApp = createApp;
var cors_1 = require("@fastify/cors");
var multipart_1 = require("@fastify/multipart");
var static_1 = require("@fastify/static");
var node_fs_1 = require("node:fs");
var node_path_1 = require("node:path");
var fastify_1 = require("fastify");
var drizzle_orm_1 = require("drizzle-orm");
var zod_1 = require("zod");
var erros_js_1 = require("./shared/erros.js");
var fotos_routes_js_1 = require("./modules/fotos/fotos.routes.js");
var familias_routes_js_1 = require("./modules/familias/familias.routes.js");
var pessoas_routes_js_1 = require("./modules/pessoas/pessoas.routes.js");
function createApp(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var app, uploadDir;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = (0, fastify_1.default)({ logger: true });
                    return [4 /*yield*/, app.register(cors_1.default, {
                            origin: opts.webOrigin,
                            methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
                        })];
                case 1:
                    _a.sent();
                    uploadDir = node_path_1.default.resolve(opts.uploadDir);
                    (0, node_fs_1.mkdirSync)(node_path_1.default.join(uploadDir, 'fotos'), { recursive: true });
                    return [4 /*yield*/, app.register(multipart_1.default, { limits: { fileSize: 5 * 1024 * 1024, files: 1 } })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, app.register(static_1.default, { root: uploadDir, prefix: '/api/uploads/' })];
                case 3:
                    _a.sent();
                    app.setErrorHandler(function (erro, _req, reply) {
                        if (erro instanceof zod_1.ZodError) {
                            return reply.status(400).send({ erro: 'Dados inválidos', detalhes: erro.flatten() });
                        }
                        if (erro instanceof erros_js_1.ErroNegocio) {
                            return reply.status(erro.status).send({ erro: erro.message });
                        }
                        app.log.error(erro);
                        return reply.status(500).send({ erro: 'Erro interno' });
                    });
                    app.get('/api/health', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, ({ ok: true })];
                    }); }); });
                    app.get('/api/health/db', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, opts.db.execute((0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["select 1"], ["select 1"]))))];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/, { ok: true, db: 'conectado' }];
                            }
                        });
                    }); });
                    return [4 /*yield*/, app.register((0, pessoas_routes_js_1.pessoasRoutes)(opts.db), { prefix: '/api' })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, app.register((0, familias_routes_js_1.familiasRoutes)(opts.db), { prefix: '/api' })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, app.register((0, fotos_routes_js_1.fotosRoutes)(opts.db, uploadDir), { prefix: '/api' })];
                case 6:
                    _a.sent();
                    return [2 /*return*/, app];
            }
        });
    });
}
var templateObject_1;
