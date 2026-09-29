# Performance, fluidez e volumetria

Documento de revisão de performance do MangoCine: fluidez da UI e comportamento
com grandes volumes de dados (sem travar a UI nem estourar memória).

## 1. O que já está aplicado

### Lista (`FlatList`) — `MovieListScreen`

| Configuração | Valor | Motivo |
| :-- | :-- | :-- |
| `numColumns` | `2` | Grade de catálogo |
| `removeClippedSubviews` | `Platform.OS === 'android'` | Reduz memória no Android; desligado no iOS por bugs conhecidos de células em branco |
| `maxToRenderPerBatch` | `8` | Menos trabalho de JS por lote |
| `updateCellsBatchingPeriod` | `50ms` | Espalha o trabalho de render |
| `windowSize` | `7` | Menos células montadas ao mesmo tempo (memória) |
| `initialNumToRender` | `6` | Primeira tela rápida |
| `keyboardDismissMode` | `on-drag` | Evita re-renders por teclado |
| `keyboardShouldPersistTaps` | `handled` | Melhor UX na busca |
| `React.memo` no `MovieCard` | — | Evita re-render ao paginar/digitar |
| `handleEndReached` | guarda `isFetching/isLoading/isError/paginationError` | Evita paginação descontrolada |

### Imagens

- `AppImage` sobre `@d11/react-native-fast-image`: **cache de memória + disco**
  (`cacheControl.immutable`), `priority` e `Skeleton`/fallback embutidos.
- Resolução por contexto (`w342` grade, `w500` pôster, `original` backdrop).
- `preloadImages` pré-aquece os pôsteres das próximas páginas.
- `Skeleton` pulsante com `useNativeDriver: true` (roda na thread de UI).

### Virtualização

- **Header sticky fora do `FlatList`** (marca + busca fixas; filtros colapsáveis).
  Isso mantém o `getItemLayout` exato — o `ListMetricsAggregator` do RN **não**
  soma a altura do header, então header dentro da lista quebraria os offsets.
- **Card de altura fixa** (`MOVIE_CARD_INFO_HEIGHT`) + wrapper determinístico →
  `getItemLayout = row * rowHeight`.
- **Prefetch sequencial de 5 páginas** no primeiro load (uma após a outra, para
  o append-merge não inverter a ordem) + `onEndReachedThreshold` alto.
- Filtros colapsam no scroll (animação só no toggle; `onScroll` sem re-render
  por frame).

### Rede / estado

- RTK Query com deduplicação, cache e `merge` que **deduplica por `id`** ao
  paginar (evita crescer com itens repetidos).
- Prefetch otimista em `onPressIn` para o detalhe abrir instantâneo.
- `useDebounce` (400ms) na busca.

## 2. Análise de volumetria / OOM

O risco real de OOM em uma lista de pôsteres **não é o JSON** (poucos KB por
item), e sim:

1. **Bitmaps em memória:** cada imagem decodificada ocupa `largura × altura × 4`
   bytes. 100 pôsteres `w342` (≈342×513) ≈ **70 MB** de bitmap se todos ficarem
   vivos. É por isso que `windowSize`/`removeClippedSubviews` importam.
2. **Crescimento do cache de dados:** o `merge` acumula páginas por categoria.
   Isso é intencional (permite continuar rolando), mas é limitado naturalmente
   pelo uso.
3. **Render/layout de muitas células:** mitigado por batch/window.

### Mitigações aplicadas

- Janela de render pequena (`windowSize: 7`) → poucos bitmaps vivos por vez.
- `removeClippedSubviews` no Android → descarta views fora da tela.
- Deduplicação no `merge` → sem duplicatas inflando memória.
- **Cap de páginas por sessão** (`MAX_CATEGORY_PAGES = 25`, `MAX_SEARCH_PAGES = 10`)
  → teto de ~500 itens por categoria; ao atingir, a paginação para e o rodapé
  informa "mostrando os primeiros resultados".
- **Card de altura fixa com fonte limitada** (`maxFontSizeMultiplier = 1.25`) →
  a geometria determinística não é quebrada por acessibilidade.
- **Skeleton espelha a geometria do card** → sem salto de layout no fim do loading.

### Mitigações recomendadas se o volume crescer

- Definir `keepUnusedDataFor` e `refetchOnFocus` conforme o uso real.
- Considerar reter apenas as últimas N páginas por categoria (descartando as
  mais antigas) se o catálogo crescer para milhares de itens por sessão.
- Migrar para cache de imagem com limite explícito (ver `adr/0001`).

## 3. Como medir (para validar antes de otimizar mais)

```bash
# Perfil de JS/CPU
npx react-native profile-hermes

# FPS no Android (tempo real)
adb shell dumpsys gfxinfo com.tmdbapp framestats

# Memória no Android
adb shell dumpsys meminfo com.tmdbapp
```

No iOS: **Xcode → Debug Navigator → Memory / CPU** e **Instruments (Time
Profiler / Allocations)**.

### Metas

- Scroll sustentando ~60fps (sem quedas < 55fps) em dispositivo de entrada.
- Sem crescimento monotônico de memória durante scroll contínuo.
- Sem OOM mesmo percorrendo centenas de itens.
