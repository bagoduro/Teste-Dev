const mongoose = require('mongoose');

/**
 * Conexão simples com cache para uso em funções serverless:
 * Evita múltiplas conexões em hot-reloads.
 */

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env or in Vercel settings');
}

let cached = global._mongoCache || (global._mongoCache = { conn: null, promise: null });

async function connect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      // recommended options
      bufferCommands: false,
      // use unified topology by default in mongoose 6+
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connect };
