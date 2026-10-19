import { createApp } from './app.js';
import { env } from './config/env.js';
import { criarDb } from './db/client.js';

const { db } = criarDb(env.DATABASE_URL);
const app = await createApp({ db, webOrigin: env.WEB_ORIGIN, uploadDir: env.UPLOAD_DIR });
await app.listen({ port: env.PORT, host: '0.0.0.0' });
