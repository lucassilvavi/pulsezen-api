#!/usr/bin/env node

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { app } from './app/app.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Boot the application
await app.boot()
await app.start()

// Import models
const { default: UserDevice } = await import('./app/models/user_device.js')

try {
  // Get the latest device
  const device = await UserDevice.query().orderBy('created_at', 'desc').first()
  
  if (device) {
    console.log('Device found:')
    console.log('ID:', device.id)
    console.log('Name:', device.deviceName)
    console.log('Capabilities:', JSON.stringify(device.capabilities, null, 2))
    console.log('Has Biometrics:', device.capabilities?.hasBiometrics)
    console.log('Type of capabilities:', typeof device.capabilities)
  } else {
    console.log('No devices found')
  }
} catch (error) {
  console.error('Error:', error)
} finally {
  await app.terminate()
}
