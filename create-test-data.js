/**
 * Script para criar dados de teste para predição
 */

import Database from '@adonisjs/lucid/services/db'

const userId = '34577c74-a74a-4d03-9401-49ec486a05d9'; // ID do usuário teste

async function createTestMoodEntries() {
  console.log('Criando entradas de mood de teste...');
  
  // Dados de teste variados para últimos 10 dias
  const moodLevels = ['excelente', 'bem', 'neutro', 'mal', 'pessimo'];
  const periods = ['manha', 'tarde', 'noite'];
  
  const entries = [];
  
  for (let i = 0; i < 10; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Criar 1-2 entradas por dia
    const entriesPerDay = Math.random() > 0.3 ? 2 : 1;
    
    for (let j = 0; j < entriesPerDay; j++) {
      const entry = {
        id: `mood_${Date.now()}_${i}_${j}`,
        user_id: userId,
        mood_level: moodLevels[Math.floor(Math.random() * moodLevels.length)],
        period: periods[j % periods.length],
        date: date.toISOString().split('T')[0],
        timestamp: date.getTime() + (j * 3600000), // Add hours offset
        notes: `Teste entrada ${i}-${j}`,
        activities: JSON.stringify(['teste']),
        emotions: JSON.stringify(['calmo']),
        created_at: date.toISOString(),
        updated_at: date.toISOString()
      };
      entries.push(entry);
    }
  }
  
  // Inserir no banco
  try {
    await Database.table('mood_entries').insert(entries);
    console.log(`✅ ${entries.length} entradas de mood criadas com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao criar entradas:', error);
  }
}

async function createTestJournalEntries() {
  console.log('Criando entradas de journal de teste...');
  
  const journalTexts = [
    'Hoje me senti bem, consegui fazer exercícios',
    'Dia difícil, muitas preocupações com trabalho',
    'Gratidão por momentos de paz',
    'Ansioso sobre o futuro, mas tentando focar no presente',
    'Celebrando pequenas vitórias'
  ];
  
  const entries = [];
  
  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i * 2);
    
    const entry = {
      id: `journal_${Date.now()}_${i}`,
      user_id: userId,
      title: `Reflexão ${i + 1}`,
      content: journalTexts[i],
      mood_before: Math.floor(Math.random() * 5) + 1,
      mood_after: Math.floor(Math.random() * 5) + 1,
      created_at: date.toISOString(),
      updated_at: date.toISOString()
    };
    entries.push(entry);
  }
  
  // Inserir no banco
  try {
    await Database.table('journal_entries').insert(entries);
    console.log(`✅ ${entries.length} entradas de journal criadas com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao criar entradas journal:', error);
  }
}

// Executar
async function main() {
  try {
    await createTestMoodEntries();
    await createTestJournalEntries();
    console.log('🎉 Dados de teste criados com sucesso!');
  } catch (error) {
    console.error('💥 Erro geral:', error);
  } finally {
    process.exit(0);
  }
}

main();