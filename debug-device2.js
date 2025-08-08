#!/usr/bin/env node

/**
 * Debug script para verificar dados do dispositivo
 */
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { execa } from 'execa'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

try {
  // Usar node ace para rodar comando dentro do contexto do AdonisJS
  const result = await execa('node', ['ace', 'repl'], {
    cwd: __dirname,
    input: `
const UserDevice = (await import('#models/user_device')).default
const device = await UserDevice.query().orderBy('created_at', 'desc').first()
if (device) {
  console.log('Device found:', device.id)
  console.log('Capabilities:', device.capabilities)
  console.log('Has Biometrics:', device.capabilities?.hasBiometrics)
  console.log('Type:', typeof device.capabilities)
} else {
  console.log('No devices found')
}
process.exit(0)
    `,
    stdio: 'inherit'
  })
} catch (error) {
  console.error('Error running debug script:', error)
}
