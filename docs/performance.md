# Performance, fluidez e volumetria

Documento de revisão de performance do MangoCine: fluidez da UI e comportamento
com grandes volumes de dados (sem travar a UI nem estourar memória).

## 1. O que já está aplicado

### Lista (`FlatList`) — `MovieListScreen`

| Configuração                | Valor                                                 | Motivo                                                                              |
| :-------------------------- | :---------------------------------------------------- | :---------------------------------------------------------------------------------- |
| `numColumns`                | `2`                                                   | Grade de catálogo                                                                   |
| `removeClippedSubviews`     | `Platform.OS === 'android'`                           | Reduz memória no Android; desligado no iOS por bugs conhecidos de células em branco |
| `maxToRenderPerBatch`       | `8`                                                   | Menos trabalho de JS por lote                                                       |
| `updateCellsBatchingPeriod` | `50ms`                                                | Espalha o trabalho de render                                                        |
| `windowSize`                | `7`                                                   | Menos células montadas ao mesmo tempo (memória)                                     |
| `initialNumToRender`        | `6`                                                   | Primeira tela rápida                                                                |
| `keyboardDismissMode`       | `on-drag`                                             | Evita re-renders por teclado                                                        |
| `keyboardShouldPersistTaps` | `handled`                                             | Melhor UX na busca                                                                  |
| `React.memo` no `MovieCard` | —                                                     | Evita re-render ao paginar/digitar                                                  |
| `handleEndReached`          | guarda `isFetching/isLoading/isError/paginationError` | Evita paginação descontrolada                                                       |

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
- **Card de altura fixa** (pôster 2:3 + borda, ver `MovieCard`) + wrapper
  determinístico → `getItemLayout = row * rowHeight`.
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

## 3. Medição in-app (dev-only)

O app traz um monitor de frames em `src/shared/perf/` que roda **somente em
`__DEV__`**:

- `usePerfMonitor` amostra `requestAnimationFrame` em janelas de 1s
  (`fps`, `avgFrameMs`, `worstFrameMs`, `droppedFrames`, `jankRate`).
- `summarizeFrames` é uma função pura (testada em `__tests__/perf`) — a mesma
  lógica que roda no dispositivo é a que os testes cobrem.
- `PerfOverlay` monta um HUD no topo da tela: um _pill_ não-interativo com o FPS
  atual (verde ≥55, âmbar ≥45, vermelho abaixo). Os detalhes (média/pior frame,
  jank) ficam disponíveis via `usePerfMonitor`/`summarizeFrames` e nas
  ferramentas nativas abaixo.

Como usar: rode em dev, faça scroll contínuo no catálogo e observe quedas. O
`worstFrameMs` denuncia _spikes_ (ex.: decodificação de imagem) que a média
esconde.

> Em produção o overlay não é renderizado (`if (!__DEV__) return null`) e o
> monitor fica desabilitado — custo zero no bundle de release.

## 4. Como medir (validação nativa)

O monitor in-app mede o **frame pacing do JS**. Para memória e CPU reais use as
ferramentas nativas, **sempre em build de release** (dev tem overhead de Metro
e logging):

```bash
# Android — FPS/framestats (jank por frame)
adb shell dumpsys gfxinfo com.tmdbapp framestats

# Android — memória (heap Java/Native, bitmaps)
adb shell dumpsys meminfo com.tmdbapp

# Android — traço de sistema (perfetto) para jank + CPU
adb shell perfetto -o /data/misc/perfetto-traces/trace -t 10s \
  sched freq idle am wm gfx view binder_driver hal dalvik camera input res
adb pull /data/misc/perfetto-traces/trace

# Perfil de CPU do bundle Hermes
npx react-native profile-hermes
```

No iOS: **Xcode → Debug Navigator** (Memory/CPU), **Instruments → Time
Profiler / Allocations / Core Animation**, e o **Frame Pacing** do simulador.

No Android também vale o [Flashlight](https://github.com/bamlab/flashlight),
que agrega FPS/RAM/CPU num score único para comparar builds.

### Roteiro de teste (carga)

1. Abrir o catálogo e rolar até o cap de páginas (`MAX_CATEGORY_PAGES`).
2. Trocar de categoria e voltar (valida reset do cache/`scrollToOffset`).
3. Buscar, limpar e buscar de novo (valida debounce + cache por termo).
4. Alternar idioma (valida `resetApiState` sem vazar páginas).
5. Repetir em release, anotando FPS mínimo e RSS pico.

### Metas

- Scroll sustentando ~60fps (sem quedas < 55fps) em dispositivo de entrada.
- `worstFrameMs` sem spikes recorrentes durante o scroll.
- Sem crescimento monotônico de memória durante scroll contínuo.
- Sem OOM mesmo percorrendo centenas de itens.
