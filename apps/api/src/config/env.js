"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
var zod_1 = require("zod");
var schema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().min(1, 'DATABASE_URL é obrigatória'),
    PORT: zod_1.z.coerce.number().int().default(3333),
    WEB_ORIGIN: zod_1.z.string().default('http://localhost:5173'),
    UPLOAD_DIR: zod_1.z.string().default('./uploads'),
});
exports.env = schema.parse(process.env);
