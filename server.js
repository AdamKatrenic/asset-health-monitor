require('dotenv').config()
const app = require('./src/app')
const { connectRedis } = require('./src/redis')
const initDb = require('./src/initDb')

const PORT = process.env.PORT || 3000

const start = async () => {
  await connectRedis()
  await initDb()
  app.listen(PORT, () => {
    console.log(`Server beží na porte ${PORT}`)
  })
}

start()