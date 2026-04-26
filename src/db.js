const { Pool } = require('pg')

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'admin',
  password: 'password123',
  database: 'asset_health'
})

module.exports = pool