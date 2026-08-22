const mongoose = require('mongoose');

async function connectDb(uri = process.env.MONGODB_URI, retries = 3) {
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }
  mongoose.set('strictQuery', true);

  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 20000,
        maxPoolSize: 20,
      });
      const { host, name } = mongoose.connection;
      console.log(`MongoDB connected → ${host} / db:${name}`);

      // Ensure compound indexes exist (idempotent)
      await Promise.all(
        Object.values(mongoose.models).map((model) =>
          model.syncIndexes().catch((err) => {
            console.warn(`Index sync ${model.modelName}:`, err.message);
          })
        )
      );
      console.log('MongoDB indexes synced');
      return;
    } catch (err) {
      lastErr = err;
      console.error(`MongoDB connect attempt ${attempt}/${retries} failed:`, err.message);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 2000 * attempt));
      }
    }
  }
  throw lastErr;
}

module.exports = { connectDb };
