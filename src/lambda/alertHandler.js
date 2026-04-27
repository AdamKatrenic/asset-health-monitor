const handler = async (event) => {
  const { machineId, machineName, temperature, threshold } = event

  console.log(`Alert pre ${machineName}: teplota ${temperature}°C prekročila limit ${threshold}°C`)

  const alert = {
    machineId,
    machineName,
    temperature,
    threshold,
    severity: temperature > threshold + 20 ? 'CRITICAL' : 'WARNING',
    timestamp: new Date().toISOString(),
    message: `Zariadenie ${machineName} má teplotu ${temperature}°C (limit: ${threshold}°C)`
  }

  console.log('Alert odoslaný:', JSON.stringify(alert))
  return alert
}

module.exports = { handler }