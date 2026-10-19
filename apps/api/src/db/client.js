"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.criarDb = criarDb;
var node_postgres_1 = require("drizzle-orm/node-postgres");
var pg_1 = require("pg");
var schema = require("./schema.js");
function criarDb(databaseUrl) {
    var pool = new pg_1.default.Pool({ connectionString: databaseUrl });
    return { db: (0, node_postgres_1.drizzle)(pool, { schema: schema }), pool: pool };
}
