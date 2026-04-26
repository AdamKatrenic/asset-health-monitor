const express = require('express')
const machinesRouter = require('./routes/machines')  // pridaj tento riadok

const app = express()
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Asset Health Monitor beží!' })
})

app.use('/api/machines', machinesRouter)  // pridaj tento riadok

module.exports = app