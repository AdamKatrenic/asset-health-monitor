const express = require('express')
const router = express.Router()

let machines = [
  { id: 1, name: 'Excavator CAT 320', status: 'online', temperature: 72 },
  { id: 2, name: 'Bulldozer CAT D6', status: 'offline', temperature: 45 },
]

router.get('/', (req, res) => {
  res.json(machines)
})

router.get('/:id', (req, res) => {
  const machine = machines.find(m => m.id === parseInt(req.params.id))
  if (!machine) return res.status(404).json({ error: 'Zariadenie nenájdené' })
  res.json(machine)
})

router.post('/', (req, res) => {
  const { name, status, temperature } = req.body

  if (!name || !status) {
    return res.status(400).json({ error: 'name a status sú povinné' })
  }

  const newMachine = {
    id: machines.length + 1,
    name,
    status,
    temperature: temperature || 0
  }

  machines.push(newMachine)
  res.status(201).json(newMachine)
})

router.put('/:id', (req, res) => {
  const machine = machines.find(m => m.id === parseInt(req.params.id))
  if (!machine) return res.status(404).json({ error: 'Zariadenie nenájdené' })

  const { name, status, temperature } = req.body
  if (name) machine.name = name
  if (status) machine.status = status
  if (temperature !== undefined) machine.temperature = temperature

  res.json(machine)
})

router.delete('/:id', (req, res) => {
  const index = machines.findIndex(m => m.id === parseInt(req.params.id))
  if (index === -1) return res.status(404).json({ error: 'Zariadenie nenájdené' })

  machines.splice(index, 1)
  res.status(204).send()
})

module.exports = router