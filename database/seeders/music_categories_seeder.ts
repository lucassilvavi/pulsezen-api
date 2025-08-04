import { BaseSeeder } from '@adonisjs/lucid/seeders'
import MusicCategory from '../../app/modules/music/models/music_category.js'

export default class extends BaseSeeder {
  async run() {
    // Limpar dados existentes
    await MusicCategory.query().delete()

    // Criar categorias baseadas nos mocks
    await MusicCategory.createMany([
      {
        id: 'stories',
        title: 'Histórias para Dormir',
        description: 'Narrativas relaxantes que ajudam você a adormecer',
        icon: '📖',
        color: '#6B73FF',
        isActive: true,
        sortOrder: 1,
      },
      {
        id: 'sounds',
        title: 'Sons Relaxantes',
        description: 'Ambientes sonoros para uma noite tranquila',
        icon: '🎵',
        color: '#4ECDC4',
        isActive: true,
        sortOrder: 2,
      },
      {
        id: 'meditations',
        title: 'Meditações para Dormir',
        description: 'Práticas guiadas para relaxamento profundo',
        icon: '🧘‍♀️',
        color: '#45B7D1',
        isActive: true,
        sortOrder: 3,
      },
    ])

    console.log('✅ Music categories seeded successfully')
  }
}
