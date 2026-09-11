const { createClient } = require("redis");

const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = process.env.REDIS_PORT || 6379;
const redisPass = process.env.REDIS_PASS || undefined;

const redisClient = createClient({
  username: "default",
  password: redisPass || undefined,
  socket: {
    host: redisHost,
    port: Number(redisPort),
    connectTimeout: 3000,
    reconnectStrategy: false,
  },
});

redisClient.on("error", (err) => {
  // handle redis error event so node doesn't crash
  console.warn("Redis Client Warning:", err.message);
});

module.exports = redisClient;
