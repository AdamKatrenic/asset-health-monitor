const { createClient } = require('redis')

const client = createClient({
  socket: {
    host: 'localhost',
    port: 6379
  }
})

client.on('error', (err) => console.error('Redis chyba:', err))

const connectRedis = async () => {
  await client.connect()
  console.log('Redis pripojený!')
}

module.exports = { client, connectRedis }