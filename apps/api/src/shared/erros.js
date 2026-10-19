"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.naoEncontrado = exports.ErroNegocio = void 0;
var ErroNegocio = /** @class */ (function (_super) {
    __extends(ErroNegocio, _super);
    function ErroNegocio(mensagem, status) {
        if (status === void 0) { status = 422; }
        var _this = _super.call(this, mensagem) || this;
        _this.status = status;
        return _this;
    }
    return ErroNegocio;
}(Error));
exports.ErroNegocio = ErroNegocio;
var naoEncontrado = function (o) { return new ErroNegocio("".concat(o, " n\u00E3o encontrado(a)"), 404); };
exports.naoEncontrado = naoEncontrado;
