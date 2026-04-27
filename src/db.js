const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5433,
  user: process.env.PGUSER || 'admin',
  password: process.env.PGPASSWORD || 'password123',
  database: process.env.PGDATABASE || 'asset_health'
})

module.exports = pool