const express = require('express')
const router = express.Router()
const pool = require('../db')
const { client } = require('../redis')

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM machines ORDER BY id')
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const cacheKey = `machine:${id}`

    const cached = await client.get(cacheKey)
    if (cached) {
      console.log('Cache hit!')
      return res.json(JSON.parse(cached))
    }

    console.log('Cache miss - idem do DB')
    const { rows } = await pool.query('SELECT * FROM machines WHERE id = $1', [id])
    if (rows.length === 0) return res.status(404).json({ error: 'Zariadenie nenájdené' })

    await client.setEx(cacheKey, 60, JSON.stringify(rows[0]))

    res.json(rows[0])
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { name, status, temperature } = req.body
    if (!name || !status) {
      return res.status(400).json({ error: 'name a status sú povinné' })
    }

    const { rows } = await pool.query(
      'INSERT INTO machines (name, status, temperature) VALUES ($1, $2, $3) RETURNING *',
      [name, status, temperature || 0]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, status, temperature } = req.body

    const { rows } = await pool.query(
      `UPDATE machines SET
        name = COALESCE($1, name),
        status = COALESCE($2, status),
        temperature = COALESCE($3, temperature)
       WHERE id = $4 RETURNING *`,
      [name, status, temperature, id]
    )

    if (rows.length === 0) return res.status(404).json({ error: 'Zariadenie nenájdené' })

    await client.del(`machine:${id}`)

    res.json(rows[0])
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { rows } = await pool.query('DELETE FROM machines WHERE id = $1 RETURNING *', [id])
    if (rows.length === 0) return res.status(404).json({ error: 'Zariadenie nenájdené' })

    await client.del(`machine:${id}`)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

module.exports = router