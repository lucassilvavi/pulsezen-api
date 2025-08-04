import { BaseSeeder } from '@adonisjs/lucid/seeders'
import MusicTrack from '../../app/modules/music/models/music_track.js'

export default class extends BaseSeeder {
  async run() {
    // Limpar dados existentes
    await MusicTrack.query().delete()

    // Criar tracks baseadas nos mocks
    await MusicTrack.createMany([
      // Histórias para Dormir
      {
        id: 'forest-walk',
        title: 'Caminhada na Floresta',
        artist: 'Natureza Relaxante',
        categoryId: 'stories',
        duration: 900, // 15 min
        durationFormatted: '15:00',
        filePath: '/audio/forest-walk.mp3',
        fileUrl: null,
        icon: '🌲',
        description: 'Uma jornada tranquila pelos caminhos da floresta',
        isActive: true,
        sortOrder: 1,
      },
      {
        id: 'ocean-moonlight',
        title: 'Praia ao Luar',
        artist: 'Sons do Mar',
        categoryId: 'stories',
        duration: 1200, // 20 min
        durationFormatted: '20:00',
        filePath: '/audio/ocean-moonlight.mp3',
        fileUrl: null,
        icon: '🌊',
        description: 'Relaxe com as ondas suaves sob a luz da lua',
        isActive: true,
        sortOrder: 2,
      },
      {
        id: 'serene-mountains',
        title: 'Montanhas Serenas',
        artist: 'Zen Natural',
        categoryId: 'stories',
        duration: 1080, // 18 min
        durationFormatted: '18:00',
        filePath: '/audio/serene-mountains.mp3',
        fileUrl: null,
        icon: '🏔️',
        description: 'Uma experiência de paz nas montanhas',
        isActive: true,
        sortOrder: 3,
      },

      // Sons Relaxantes
      {
        id: 'gentle-rain',
        title: 'Chuva Suave',
        artist: 'Ambiente Natural',
        categoryId: 'sounds',
        duration: 3600, // 60 min
        durationFormatted: '60:00',
        filePath: '/audio/gentle-rain.mp3',
        fileUrl: null,
        icon: '🌧️',
        description: 'Som relaxante de chuva para dormir',
        isActive: true,
        sortOrder: 1,
      },
      {
        id: 'ocean-waves',
        title: 'Ondas do Mar',
        artist: 'Oceano Profundo',
        categoryId: 'sounds',
        duration: 2700, // 45 min
        durationFormatted: '45:00',
        filePath: '/audio/ocean-waves.mp3',
        fileUrl: null,
        icon: '🌊',
        description: 'Ondas suaves para relaxamento total',
        isActive: true,
        sortOrder: 2,
      },
      {
        id: 'forest-sounds',
        title: 'Sons da Floresta',
        artist: 'Natureza Viva',
        categoryId: 'sounds',
        duration: 1800, // 30 min
        durationFormatted: '30:00',
        filePath: '/audio/forest-sounds.mp3',
        fileUrl: null,
        icon: '🌳',
        description: 'Pássaros e folhas ao vento',
        isActive: true,
        sortOrder: 3,
      },

      // Meditações para Dormir
      {
        id: 'body-scan',
        title: 'Relaxamento Corporal',
        artist: 'Mestre Zen',
        categoryId: 'meditations',
        duration: 1500, // 25 min
        durationFormatted: '25:00',
        filePath: '/audio/body-scan.mp3',
        fileUrl: null,
        icon: '🧘‍♀️',
        description: 'Escaneamento corporal para relaxamento profundo',
        isActive: true,
        sortOrder: 1,
      },
      {
        id: 'sleep-breathing',
        title: 'Respiração para Dormir',
        artist: 'Guia Meditativo',
        categoryId: 'meditations',
        duration: 600, // 10 min
        durationFormatted: '10:00',
        filePath: '/audio/sleep-breathing.mp3',
        fileUrl: null,
        icon: '💨',
        description: 'Técnicas de respiração para induzir o sono',
        isActive: true,
        sortOrder: 2,
      },
      {
        id: 'gratitude-night',
        title: 'Gratidão Noturna',
        artist: 'Coração Grato',
        categoryId: 'meditations',
        duration: 900, // 15 min
        durationFormatted: '15:00',
        filePath: '/audio/gratitude-night.mp3',
        fileUrl: null,
        icon: '🙏',
        description: 'Prática de gratidão antes de dormir',
        isActive: true,
        sortOrder: 3,
      },
    ])

    console.log('✅ Music tracks seeded successfully')
  }
}
