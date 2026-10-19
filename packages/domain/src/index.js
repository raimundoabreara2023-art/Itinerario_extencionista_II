"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ehAncestral = exports.nomesCurtos = void 0;
__exportStar(require("./tipos"), exports);
var nomeCurto_1 = require("./pessoa/nomeCurto");
Object.defineProperty(exports, "nomesCurtos", { enumerable: true, get: function () { return nomeCurto_1.nomesCurtos; } });
var ancestrais_1 = require("./familias/ancestrais");
Object.defineProperty(exports, "ehAncestral", { enumerable: true, get: function () { return ancestrais_1.ehAncestral; } });
