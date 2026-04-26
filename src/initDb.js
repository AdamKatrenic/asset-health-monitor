const pool = require('./db')

const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS machines (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL,
      temperature NUMERIC(5,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)

  const { rows } = await pool.query('SELECT COUNT(*) FROM machines')
  if (rows[0].count === '0') {
    await pool.query(`
      INSERT INTO machines (name, status, temperature) VALUES
      ('Excavator CAT 320', 'online', 72),
      ('Bulldozer CAT D6', 'offline', 45)
    `)
    console.log('Testovacie dáta vložené!')
  }

  console.log('Databáza inicializovaná!')
}

module.exports = initDb