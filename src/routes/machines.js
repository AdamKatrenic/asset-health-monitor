const express = require('express')
const router = express.Router()
const {
  getAllMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
  triggerAlert
} = require('../controllers/machinesController')

router.get('/', getAllMachines)
router.get('/:id', getMachineById)
router.post('/', createMachine)
router.put('/:id', updateMachine)
router.delete('/:id', deleteMachine)
router.post('/:id/alert', triggerAlert)

module.exports = router