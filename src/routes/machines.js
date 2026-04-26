const express = require('express')
const router = express.Router()

// Zatiaľ "fake" dáta - databázu pridáme vo fáze 3
const machines = [
  { id: 1, name: 'Excavator CAT 320', status: 'online', temperature: 72 },
  { id: 2, name: 'Bulldozer CAT D6', status: 'offline', temperature: 45 },
]

// GET /api/machines - vráti všetky zariadenia
router.get('/', (req, res) => {
  res.json(machines)
})

// GET /api/machines/:id - vráti jedno zariadenie
router.get('/:id', (req, res) => {
  const machine = machines.find(m => m.id === parseInt(req.params.id))
  if (!machine) return res.status(404).json({ error: 'Zariadenie nenájdené' })
  res.json(machine)
})

module.exports = router