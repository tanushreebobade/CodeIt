const { createClient } = require("redis");
const env = require("./env");

// redis is optional: it is only used for token revocation on logout.
// when REDIS_HOST is not configured we never attempt a connection.
const redisEnabled = Boolean(env.redisHost);

const redisClient = createClient({
  username: "default",
  password: env.redisPassword || undefined,
  socket: {
    host: env.redisHost || "127.0.0.1",
    port: env.redisPort,
    connectTimeout: 3000,
    reconnectStrategy: false,
  },
});

redisClient.on("error", (err) => {
  // handle redis error event so node doesn't crash
  console.warn("Redis Client Warning:", err.message);
});

redisClient.isEnabled = redisEnabled;

module.exports = redisClient;
