const { createClient } = require('redis')

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
})

client.on('error', (err) => console.error('Redis chyba:', err))

const connectRedis = async () => {
  await client.connect()
  console.log('Redis pripojený!')
}

module.exports = { client, connectRedis }