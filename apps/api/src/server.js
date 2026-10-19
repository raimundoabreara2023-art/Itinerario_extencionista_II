"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app_js_1 = require("./app.js");
var env_js_1 = require("./config/env.js");
var client_js_1 = require("./db/client.js");
var db = (0, client_js_1.criarDb)(env_js_1.env.DATABASE_URL).db;
var app = await (0, app_js_1.createApp)({ db: db, webOrigin: env_js_1.env.WEB_ORIGIN, uploadDir: env_js_1.env.UPLOAD_DIR });
await app.listen({ port: env_js_1.env.PORT, host: '0.0.0.0' });
