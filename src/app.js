const express = require('express')
const machinesRouter = require('./routes/machines')  
const errorHandler = require('./middleware/errorHandler')

const app = express()
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Asset Health Monitor beží!' })
})

app.use('/api/machines', machinesRouter)  
app.use(errorHandler)

module.exports = app