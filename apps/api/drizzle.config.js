"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var drizzle_kit_1 = require("drizzle-kit");
exports.default = (0, drizzle_kit_1.defineConfig)({
    dialect: 'postgresql',
    schema: './src/db/schema.ts',
    out: './drizzle',
    dbCredentials: { url: (_a = process.env.DATABASE_URL) !== null && _a !== void 0 ? _a : '' },
});
