const request = require('supertest')
const app = require('../src/app')
const pool = require('../src/db')
const { client, connectRedis } = require('../src/redis')

beforeAll(async () => {
  await connectRedis()

  await pool.query(`
    CREATE TABLE IF NOT EXISTS machines (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL,
      temperature NUMERIC(5,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
})

beforeEach(async () => {
  await pool.query('TRUNCATE TABLE machines RESTART IDENTITY')
  await pool.query(`
    INSERT INTO machines (name, status, temperature) VALUES
    ('Excavator CAT 320', 'online', 72),
    ('Bulldozer CAT D6', 'offline', 45)
  `)
})

afterAll(async () => {
  await pool.end()
  await client.quit()
})


describe('GET /api/machines', () => {
  test('vráti všetky zariadenia', async () => {
    const res = await request(app).get('/api/machines')

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveLength(2)
    expect(res.body[0].name).toBe('Excavator CAT 320')
  })
})

describe('GET /api/machines/:id', () => {
  test('vráti jedno zariadenie', async () => {
    const res = await request(app).get('/api/machines/1')

    expect(res.statusCode).toBe(200)
    expect(res.body.name).toBe('Excavator CAT 320')
  })

  test('vráti 404 ak zariadenie neexistuje', async () => {
    const res = await request(app).get('/api/machines/999')

    expect(res.statusCode).toBe(404)
    expect(res.body.error).toBe('Zariadenie nenájdené')
  })
})

describe('POST /api/machines', () => {
  test('vytvorí nové zariadenie', async () => {
    const res = await request(app)
      .post('/api/machines')
      .send({ name: 'Grader CAT 140', status: 'online', temperature: 65 })

    expect(res.statusCode).toBe(201)
    expect(res.body.name).toBe('Grader CAT 140')
    expect(res.body.id).toBeDefined()
  })

  test('vráti 400 ak chýba name', async () => {
    const res = await request(app)
      .post('/api/machines')
      .send({ status: 'online' })

    expect(res.statusCode).toBe(400)
    expect(res.body.error).toBe('name a status sú povinné')
  })
})

describe('PUT /api/machines/:id', () => {
  test('upraví zariadenie', async () => {
    const res = await request(app)
      .put('/api/machines/1')
      .send({ temperature: 99 })

    expect(res.statusCode).toBe(200)
    expect(parseFloat(res.body.temperature)).toBe(99)
  })
})

describe('DELETE /api/machines/:id', () => {
  test('vymaže zariadenie', async () => {
    const res = await request(app).delete('/api/machines/1')
    expect(res.statusCode).toBe(204)

    const check = await request(app).get('/api/machines/1')
    expect(check.statusCode).toBe(404)
  })
})