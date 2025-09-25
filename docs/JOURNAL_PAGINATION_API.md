# 📖 Journal API - Paginação e Filtros

## 🎯 Resumo da Implementação

A API do Journal agora possui suporte completo para **paginação com scroll infinito** e **filtros avançados**, otimizada para o uso no mobile.

## 🔗 Endpoint Principal

```
GET /api/v1/journal
```

## 📋 Parâmetros de Paginação

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `page` | integer | 1 | Número da página (1, 2, 3...) |
| `limit` | integer | 20 | Quantidade de itens por página |
| `offset` | integer | calculado | Deslocamento (alternativo ao page) |

## 🔍 Filtros Disponíveis

### Filtros Básicos
| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `search` | string | Busca no conteúdo, mood tags e metadata | `?search=feliz` |
| `category` | string | Categoria do prompt | `?category=reflection` |
| `isFavorite` | boolean | Apenas favoritos | `?isFavorite=true` |
| `privacyLevel` | string | Nível de privacidade | `?privacyLevel=private` |

### Filtros de Data
| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `startDate` | string | Data inicial (ISO) | `?startDate=2025-09-01` |
| `endDate` | string | Data final (ISO) | `?endDate=2025-09-30` |

### Filtros Avançados
| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `moodTags` | array | Tags de humor (array) | `?moodTags=happy&moodTags=excited` |
| `minWords` | integer | Palavra mínima | `?minWords=50` |
| `maxWords` | integer | Palavra máxima | `?maxWords=500` |

## 📱 Exemplos de Uso para Mobile

### 1. Scroll Infinito Básico
```typescript
// Primeira página
const firstPage = await JournalApiService.getEntriesPaginated({
  page: 1,
  limit: 20
});

// Próxima página (quando usuário chega no final)
if (firstPage.pagination.hasMore) {
  const nextPage = await JournalApiService.getEntriesPaginated({
    page: 2,
    limit: 20
  });
}
```

### 2. Busca com Paginação
```typescript
const searchResults = await JournalApiService.getEntriesPaginated({
  search: "ansiedade",
  page: 1,
  limit: 10
});
```

### 3. Filtros Múltiplos
```typescript
const filteredEntries = await JournalApiService.getEntriesPaginated({
  isFavorite: true,
  category: "reflection",
  minWords: 100,
  page: 1,
  limit: 15
});
```

## 📊 Estrutura de Resposta

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "content": "string",
      "wordCount": 42,
      "moodTags": ["happy", "productive"],
      "isFavorite": true,
      "createdAt": "2025-09-24T00:12:43.522+00:00",
      "...": "outros campos"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "hasMore": true,
    "totalInPage": 20
  },
  "message": "Journal entries retrieved successfully"
}
```

## 🎛️ Metadata de Paginação

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `page` | integer | Página atual solicitada |
| `limit` | integer | Limite de itens por página |
| `hasMore` | boolean | **CRÍTICO**: Se há mais páginas disponíveis |
| `totalInPage` | integer | Quantidade real de itens retornados |

## 🚀 Implementação no React Native

### Hook para Scroll Infinito
```typescript
const useJournalInfiniteScroll = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const result = await JournalApiService.getEntriesPaginated({
        page: currentPage,
        limit: 20
      });
      
      setEntries(prev => [...prev, ...result.entries]);
      setHasMore(result.pagination.hasMore);
      setCurrentPage(prev => prev + 1);
    } catch (error) {
      console.error('Erro ao carregar mais entradas:', error);
    } finally {
      setLoading(false);
    }
  };

  return { entries, hasMore, loading, loadMore };
};
```

### FlatList com Scroll Infinito
```typescript
<FlatList
  data={entries}
  renderItem={({ item }) => <JournalEntryCard entry={item} />}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
  ListFooterComponent={loading ? <LoadingSpinner /> : null}
/>
```

## 🧪 Testes da API

### Teste 1: Paginação Básica
```bash
# Primeira página
curl -X GET "http://localhost:3333/api/v1/journal?page=1&limit=1" \
  -H "Authorization: Bearer [token]"

# Segunda página  
curl -X GET "http://localhost:3333/api/v1/journal?page=2&limit=1" \
  -H "Authorization: Bearer [token]"
```

### Teste 2: Filtros
```bash
# Apenas favoritos
curl -X GET "http://localhost:3333/api/v1/journal?isFavorite=true" \
  -H "Authorization: Bearer [token]"

# Busca por texto
curl -X GET "http://localhost:3333/api/v1/journal?search=PostgreSQL" \
  -H "Authorization: Bearer [token]"

# Busca por mood tag
curl -X GET "http://localhost:3333/api/v1/journal?search=grateful" \
  -H "Authorization: Bearer [token]"
```

## ✅ Status da Implementação

- ✅ **Paginação com page/limit**: Implementada
- ✅ **Metadata hasMore**: Implementada  
- ✅ **Filtros básicos**: search, category, isFavorite
- ✅ **Filtros de data**: startDate, endDate
- ✅ **Filtros avançados**: moodTags, privacyLevel, minWords, maxWords
- ✅ **Busca em mood_tags**: Implementada com JSONB
- ✅ **Busca em metadata**: Implementada
- ✅ **Ordenação**: Por created_at DESC (mais recentes primeiro)
- ✅ **Soft delete**: Apenas entradas não deletadas

## 🎯 Próximos Passos

1. **Atualizar JournalScreen.tsx** para usar paginação
2. **Implementar hook useJournalInfiniteScroll**
3. **Substituir ScrollView por FlatList**
4. **Adicionar filtros na UI**
5. **Implementar cache local** para performance

---

**✨ A API está 100% preparada para scroll infinito no mobile!**