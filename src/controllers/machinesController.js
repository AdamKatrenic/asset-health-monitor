const pool = require('../db')
const { client } = require('../redis')
const { handler: alertHandler } = require('../lambda/alertHandler')

const getAllMachines = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM machines ORDER BY id')
    res.json(rows)
  } catch (err) {
    next(err)
  }
}


const getMachineById = async (req, res, next) => {
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
}

const createMachine = async (req, res, next) => {
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
}

const updateMachine = async (req, res, next) => {
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
}

const deleteMachine = async (req, res, next) => {
  try {
    const { id } = req.params
    const { rows } = await pool.query('DELETE FROM machines WHERE id = $1 RETURNING *', [id])
    if (rows.length === 0) return res.status(404).json({ error: 'Zariadenie nenájdené' })

    await client.del(`machine:${id}`)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

const triggerAlert = async (req, res, next) => {
  try {
    const { id } = req.params
    const { rows } = await pool.query('SELECT * FROM machines WHERE id = $1', [id])
    if (rows.length === 0) return res.status(404).json({ error: 'Zariadenie nenájdené' })

    const machine = rows[0]
    const threshold = req.body.threshold || 80

    if (parseFloat(machine.temperature) <= threshold) {
      return res.json({ message: 'Teplota je v norme', temperature: machine.temperature })
    }

    const alert = await alertHandler({
      machineId: machine.id,
      machineName: machine.name,
      temperature: parseFloat(machine.temperature),
      threshold
    })

    res.json(alert)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getAllMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
  triggerAlert
}